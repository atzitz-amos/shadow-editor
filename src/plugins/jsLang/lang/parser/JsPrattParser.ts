import {JsParser} from "./JsParser";
import {JsGrammar} from "./JsGrammar";
import {TokenType} from "../../../../lang/syntax/builder/tokens/TokenType";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {Token} from "../../../../lang/syntax/builder/tokens/Token";
import {JsExprParser} from "./JsExprParser";
import {ASTGrammar, ASTType} from "../../../../lang/syntax/builder/parser/nodes/ASTGrammar";
import {ASTBuilder} from "../../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {Marker} from "../../../../lang/syntax/builder/parser/builder/Marker";

export enum OperatorPrecedence {
    COMMA = 10,
    TERNARY = 20,
    ASSIGNMENT = 20,
    LOGICAL_OR = 30,
    LOGICAL_AND = 40,
    BITWISE_OR = 50,
    BITWISE_XOR = 60,
    BITWISE_AND = 70,
    EQUALITY = 80,
    INSTANCEOF_IN = 90,
    COMPARISON_RELATIONAL = 90,
    SHIFT = 100,
    ADDITIVE = 110,
    MULTIPLICATIVE = 120,
    EXPONENTIATION = 130,
    PREFIX = 140,
    POSTFIX = 150,
    NEW = 160,
    CALL = 160,
    ACCESS_CALL = 160,
    MEMBER = 170,
    GROUPING = 180,

    /** Used to disallow comma operator in certain contexts */
    NO_COMMA = COMMA + 1,
}

export enum ErrorHandlingMode {
    NONE,
    ROLLBACK,
    ERROR_NODE
}

export class JsPrattParser {
    private static readonly NUD_LITERALS: [TokenType, string | null, ASTType][] = [
        [JsLexicalGrammar.NUMBER_LITERAL, null, JsGrammar.NumberLiteral],
        [JsLexicalGrammar.TEMPLATE_STRING, null, JsGrammar.TemplateLiteral],
        [JsLexicalGrammar.KEYWORD, "true", JsGrammar.BooleanLiteral],
        [JsLexicalGrammar.KEYWORD, "false", JsGrammar.BooleanLiteral],
        [JsLexicalGrammar.KEYWORD, "null", JsGrammar.NullLiteral],
        [JsLexicalGrammar.KEYWORD, "undefined", JsGrammar.UndefinedLiteral],
        [JsLexicalGrammar.KEYWORD, "this", JsGrammar.ThisExpr],
        [JsLexicalGrammar.REGEX, null, JsGrammar.RegexLiteral]
    ];

    constructor(private parser: JsParser, private myExprParser: JsExprParser, private builder: ASTBuilder) {
    }

    parseExpression(rbp = 0): ErrorHandlingMode {
        const exprStart = this.builder.mark();

        let currentErrorMode = this.nud();
        if (currentErrorMode !== ErrorHandlingMode.NONE) {
            if (currentErrorMode === ErrorHandlingMode.ROLLBACK) this.builder.errorVirtual("Expected expression");
            return currentErrorMode;
        }
        while (rbp < this.bindingPower(this.builder.seek())) {
            this.led(exprStart);
        }
        exprStart.done(ASTGrammar.EXPRESSION);

        return ErrorHandlingMode.NONE;
    }

    isPrefix(type: TokenType, value: string): boolean {
        return type === JsLexicalGrammar.MATHEMATICAL_OPERATOR && (value === "+" || value === "-")
            || type === JsLexicalGrammar.LOGICAL_OPERATOR && value === "!"
            || type === JsLexicalGrammar.BITWISE_OPERATOR && value === "~"
            || type === JsLexicalGrammar.KEYWORD && (value === "typeof" || value === "void" || value === "delete")
            || type === JsLexicalGrammar.POSTFIX_OPERATOR;
    }

    parseArrayLiteral(start: Marker) {
        const oldSpreadAllowed = this.parser.isSpreadAllowed();
        this.parser.setIsSpreadAllowed(true);
        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACKET)) {
            if (this.builder.isNext(JsLexicalGrammar.COMMA)) {
                this.builder.add(JsGrammar.EmptyCommaExpr);
                this.builder.advance(); // consume ','
                continue;
            }
            this.parseExpression(OperatorPrecedence.NO_COMMA);
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            }
        }

        this.builder.expect(JsLexicalGrammar.RBRACKET).orError("Expected ']'");
        this.parser.setIsSpreadAllowed(oldSpreadAllowed);

        start.done(JsGrammar.ArrayLiteral);
    }

    parseObjectLiteral(start: Marker) {
        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACE)) {
            if (this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                continue;
            }

            if (this.builder.isNext(JsLexicalGrammar.ELLIPSIS)) {
                const spreadStart = this.builder.mark();
                this.builder.advance(); // Consume '...'
                this.parseExpression(OperatorPrecedence.ASSIGNMENT);
                spreadStart.done(JsGrammar.SpreadExpr);
            } else {
                const keyStart = this.builder.mark();
                let isComputed = false;

                // 1. Property Key
                if (this.builder.consumeIf(JsLexicalGrammar.LBRACKET)) {
                    isComputed = true;
                    this.parseExpression(); // Computed key expression
                    this.builder.expect(JsLexicalGrammar.RBRACKET).orError("Expected ']'");
                } else {
                    const keyToken = this.builder.advance();
                    if (!keyToken) {
                        this.builder.errorVirtual("Unexpected end of object literal");
                        keyStart.rollback();
                        break;
                    }
                }

                // 2. Property Value or Shorthand
                if (this.builder.consumeIf(JsLexicalGrammar.COLON)) {
                    keyStart.done(JsGrammar.ObjectPropertyKey);

                    const valStart = this.builder.mark();
                    this.parseExpression(OperatorPrecedence.ASSIGNMENT);
                    valStart.done(JsGrammar.ObjectPropertyValue);
                } else if (!isComputed && this.builder.lookBehind()?.getType() === JsLexicalGrammar.IDENTIFIER) {
                    // Shorthand property (e.g., { myVar })
                    keyStart.done(JsGrammar.ObjectPropertyShorthand);
                } else {
                    keyStart.done(JsGrammar.ObjectPropertyKey);
                    this.builder.errorVirtual("Expected ':' after property key");
                }
            }
        }

        this.builder.expect(JsLexicalGrammar.RBRACE).orError("Expected '}'");
        start.done(JsGrammar.ObjectLiteral);
    }

    tryParseGroupingOrArrowFunction(start: Marker, hasAsyncToken: boolean = false) {
        if (this.builder.done()) {
            this.builder.errorVirtual("Unexpected end of input");
            return ErrorHandlingMode.ERROR_NODE;
        }
        const rollbackMarker = this.builder.mark();

        // Speculatively parse as function parameters: (a, b)
        this.parseFunctionArguments();

        if (this.builder.isNext(JsLexicalGrammar.RPAREN)) {
            const next = this.builder.lookAhead(1);
            if (next && next.getValue() === "=>") {
                rollbackMarker.done(JsGrammar.FunctionArguments);
                this.builder.advance(); // Consume ')'

                if (!this.builder.beforeNewLine()) {
                    this.builder.advance(); // Consume '=>'

                    // Arrow Function Body
                    if (this.builder.isNext(JsLexicalGrammar.LBRACE)) {
                        this.parseArrowFunctionBlockBody(hasAsyncToken);
                    } else {
                        this.parseExpression(OperatorPrecedence.ASSIGNMENT);
                    }

                    start.done(JsGrammar.ArrowFunctionExpression);
                    return ErrorHandlingMode.NONE;
                }
            }
        }

        // Not an arrow function! Gracefully rollback state to the open parenthesis
        this.builder.rollbackTo(rollbackMarker);

        // Standard grouping expression parsing
        this.parseExpression();
        this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
        start.done(JsGrammar.GroupExpr);

        return ErrorHandlingMode.NONE;
    }

    tryParseIdentifierOrArrowFunction(start: Marker, hasAsyncToken: boolean = false) {
        const next = this.builder.seek();

        // Differentiate `a => {}` from a simple identifier `a`
        if (!this.builder.beforeNewLine() && next && next.getValue() === "=>") {
            this.builder.advance(); // Consume '=>'

            // Arrow Function Body
            if (this.builder.isNext(JsLexicalGrammar.LBRACE)) {
                this.parseArrowFunctionBlockBody(hasAsyncToken);
            } else {
                this.parseExpression(OperatorPrecedence.ASSIGNMENT);
            }

            start.done(JsGrammar.ArrowFunctionExpression);
            return;
        } else {
            if (hasAsyncToken) {
                this.builder.popAndError("Unexpected identifier");
            }
            start.done(JsGrammar.Identifier);
        }
    }

    parseFunctionArguments() {
        const oldSpreadAllowed = this.parser.isSpreadAllowed();
        this.parser.setIsSpreadAllowed(true);
        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RPAREN)) {
            this.parseExpression(OperatorPrecedence.COMMA);
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            }
        }

        this.parser.setIsSpreadAllowed(oldSpreadAllowed);
    }

    /**
     * Helper to parse the `{ ... }` body of an Arrow Function.
     * Applies `JsGrammar.CodeBlock` using your builder patterns.
     */
    private parseArrowFunctionBlockBody(isAsync: boolean) {
        this.parser.parseBlock(true, true, isAsync, false)
    }

    private nud(): ErrorHandlingMode {
        const start = this.builder.mark();
        const token = this.builder.advance();
        if (!token) {
            this.builder.errorVirtual("Unexpected end of input");
            return ErrorHandlingMode.ERROR_NODE;
        }

        const type = token.getType();
        const value = token.getValue();

        for (const [checkedType, checkedValue, astType] of JsPrattParser.NUD_LITERALS) {
            if (type === checkedType && (checkedValue === null || checkedValue === value)) {
                start.done(astType);
                return ErrorHandlingMode.NONE;
            }
        }

        if (type === JsLexicalGrammar.STRING_LITERAL) {
            start.done(JsGrammar.StringLiteral);
            if (value.length < 2 || !value.charAt(value.length - 1).match(/['"`]/)) {
                this.builder.errorVirtual("Unterminated string literal");
                return ErrorHandlingMode.ERROR_NODE;
            }
            return ErrorHandlingMode.NONE;
        }

        if (this.isPrefix(type, value)) {
            this.parseExpression(OperatorPrecedence.PREFIX);
            start.done(JsGrammar.PrefixOperator);
        } else if (type === JsLexicalGrammar.ELLIPSIS) {
            if (!this.parser.isSpreadAllowed()) {
                this.builder.errorOn(token, "Spread operator is not allowed here");
                return this.nud();  // We still want to parse the expression after the ellipsis
            }
            this.parseExpression(OperatorPrecedence.PREFIX);
            start.done(JsGrammar.SpreadExpr);
        } else if (type === JsLexicalGrammar.KEYWORD || value === "async" || value === "await") {
            this.parseKeywordNud(value, start);
        } else if (type === JsLexicalGrammar.LPAREN) {
            return this.tryParseGroupingOrArrowFunction(start);
        } else if (type === JsLexicalGrammar.IDENTIFIER) {
            this.tryParseIdentifierOrArrowFunction(start);
        } else {
            if (type === JsLexicalGrammar.LBRACKET) {
                this.parseArrayLiteral(start);
            } else if (type === JsLexicalGrammar.LBRACE) {
                this.parseObjectLiteral(start);
            } else {
                if (this.bindingPower(token) > 0) {
                    start.rollback();
                    return ErrorHandlingMode.ROLLBACK;
                } else {
                    this.builder.popAndError("Unexpected token");
                    return ErrorHandlingMode.ERROR_NODE;
                }
            }
        }

        return ErrorHandlingMode.NONE;
    }

    private parseKeywordNud(value: string, start: Marker) {
        switch (value) {
            case "function":
                this.myExprParser.parseFunctionExpression(start);
                break;
            case "class":
                this.myExprParser.parseClassExpression(start);
                break;
            case "new":
                this.parseExpression(OperatorPrecedence.CALL);

                if (this.builder.isNext(JsLexicalGrammar.LPAREN)) {
                    this.builder.advance();
                    this.parseFunctionArguments();
                    this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
                }

                start.done(JsGrammar.NewExpr);
                break;
            case "import":
                this.myExprParser.parseImportExpression(start);
                break;
            case "super":
                this.myExprParser.parseSuperExpression(start);
                break;
            case "async":
                const notBeforeNL = !this.builder.beforeNewLine();

                if (notBeforeNL && this.builder.isNext(JsLexicalGrammar.KEYWORD, "function")) {
                    this.myExprParser.parseFunctionExpression(start, true);
                } else {
                    const next = this.builder.seek();
                    if (notBeforeNL && next && next.getType() === JsLexicalGrammar.LPAREN) {
                        this.builder.advance(); // Consume '('
                        this.tryParseGroupingOrArrowFunction(start, true);
                    } else if (notBeforeNL && next && next.getType() === JsLexicalGrammar.IDENTIFIER) {
                        this.builder.advance(); // Consume the identifier (argument)
                        this.tryParseIdentifierOrArrowFunction(start);
                    } else {
                        start.done(JsGrammar.Identifier);
                    }
                }
                break
            case "yield":
                this.myExprParser.parseYieldExpression(start);
                break;
            case "await":
                if (this.parser.isAsyncAllowed()) {
                    this.parseExpression(OperatorPrecedence.PREFIX);
                    start.done(JsGrammar.AwaitStatement);
                } else
                    this.tryParseIdentifierOrArrowFunction(start);
                break;
            default:
                this.builder.popAndError(`Unexpected keyword '${value}'`);
                break;
        }
    }

    private led(marker: Marker) {
        const token = this.builder.advance();
        if (!token) {
            this.builder.errorVirtual("Unexpected end of input");
            return;
        }

        const type = token.getType();

        if (type === JsLexicalGrammar.MATHEMATICAL_OPERATOR
            || type === JsLexicalGrammar.COMPARISON_OPERATOR
            || type === JsLexicalGrammar.LOGICAL_OPERATOR
            || type === JsLexicalGrammar.BITWISE_OPERATOR) {
            const bp = this.bindingPower(token);
            this.parseExpression(token.getValue() === "**" ? bp - 1 : bp); // Right associative for **
            marker.done(JsGrammar.BinaryExpr);
            return;
        } else if (type === JsLexicalGrammar.QUESTION_MARK) {
            this.parseExpression();
            this.builder.expect(JsLexicalGrammar.COLON).orError("Expected ':'");
            this.parseExpression(OperatorPrecedence.TERNARY - 1);
            marker.done(JsGrammar.TernaryExpr);
            return;
        } else if (type === JsLexicalGrammar.ASSIGNMENT_OPERATOR) {
            const bp = this.bindingPower(token);
            this.parseExpression(bp - 1); // Right associative
            marker.done(JsGrammar.AssignmentExpr);
            return;
        } else if (type === JsLexicalGrammar.DOT) {
            if (this.builder.isNext(JsLexicalGrammar.KEYWORD)) {
                const keywordToken = this.builder.advance();
                if (keywordToken) {
                    marker.done(JsGrammar.MemberAccessExpr);
                    return;
                }
            }
            const propToken = this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected property name");
            if (propToken) {
                marker.done(JsGrammar.MemberAccessExpr);
            }
            return;
        } else if (type === JsLexicalGrammar.LPAREN) {
            // Call expression
            this.parseFunctionArguments();
            this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
            marker.done(JsGrammar.CallExpr);
            return;
        } else if (type === JsLexicalGrammar.LBRACKET) {
            // Computed member access
            this.parseExpression();
            this.builder.expect(JsLexicalGrammar.RBRACKET).orError("Expected ']'");
            marker.done(JsGrammar.ArrayAccessExpr);
            return;
        } else if (type === JsLexicalGrammar.POSTFIX_OPERATOR) {
            marker.done(JsGrammar.PostfixOperator);
            return;
        } else if (type === JsLexicalGrammar.COMMA) {
            this.parseExpression(OperatorPrecedence.COMMA);
            marker.done(JsGrammar.CommaExpr);
            return;
        } else if ((type === JsLexicalGrammar.KEYWORD && token.getValue() === "instanceof") || token.getValue() === "in" && !this.myExprParser.isPotentiallyInLoop()) {
            this.parseExpression(OperatorPrecedence.INSTANCEOF_IN);
            marker.done(JsGrammar.BinaryExpr);
            return;
        }
    }

    private bindingPower(token: Token | null): number {
        if (!token) return 0;

        const type = token.getType();

        if (type === JsLexicalGrammar.MATHEMATICAL_OPERATOR) {
            if (token.getValue() === "+" || token.getValue() === "-") return OperatorPrecedence.ADDITIVE;
            return token.getValue() === "**" ? OperatorPrecedence.EXPONENTIATION : OperatorPrecedence.MULTIPLICATIVE;
        } else if (type === JsLexicalGrammar.ASSIGNMENT_OPERATOR) {
            return OperatorPrecedence.ASSIGNMENT;
        } else if (type === JsLexicalGrammar.LOGICAL_OPERATOR) {
            switch (token.getValue()) {
                case "??":
                case "||":
                    return OperatorPrecedence.LOGICAL_OR;
                case "&&":
                    return OperatorPrecedence.LOGICAL_AND;
                default:
                    return 0;
            }
        } else if (type === JsLexicalGrammar.COMPARISON_OPERATOR) {
            switch (token.getValue()) {
                case "==":
                case "!=":
                case "===":
                case "!==":
                    return OperatorPrecedence.EQUALITY;
                case "<":
                case "<=":
                case ">":
                case ">=":
                    return OperatorPrecedence.COMPARISON_RELATIONAL;
                default:
                    return 0;
            }
        } else if (type === JsLexicalGrammar.BITWISE_OPERATOR) {
            switch (token.getValue()) {
                case "|":
                    return OperatorPrecedence.BITWISE_OR;
                case "^":
                    return OperatorPrecedence.BITWISE_XOR;
                case "&":
                    return OperatorPrecedence.BITWISE_AND;
                case "<<":
                case ">>":
                case ">>>":
                    return OperatorPrecedence.SHIFT;
                default:
                    return 0;
            }
        } else if (type === JsLexicalGrammar.POSTFIX_OPERATOR) {
            return this.builder.beforeNewLine() ? 0 : OperatorPrecedence.POSTFIX;
        } else if (type === JsLexicalGrammar.KEYWORD) {
            if (token.getValue() === "instanceof") {
                return OperatorPrecedence.INSTANCEOF_IN;
            } else if (token.getValue() === "in" && !this.myExprParser.isPotentiallyInLoop()) {
                return OperatorPrecedence.INSTANCEOF_IN;
            }
            return 0;
        } else if (type === JsLexicalGrammar.LPAREN || type === JsLexicalGrammar.LBRACKET) {
            return OperatorPrecedence.ACCESS_CALL;
        } else if (type === JsLexicalGrammar.DOT) {
            return OperatorPrecedence.MEMBER;
        } else if (type === JsLexicalGrammar.QUESTION_MARK) {
            return OperatorPrecedence.TERNARY;
        } else if (type === JsLexicalGrammar.COMMA) {
            return OperatorPrecedence.COMMA;
        }
        return 0;
    }
}