import {JsParser} from "./JsParser";
import {ASTBuilder} from "../../../../editor/lang/ast/builder/ASTBuilder";
import {JsGrammar} from "./JsGrammar";
import {TokenType} from "../../../../editor/lang/tokens/TokenType";
import {ASTGrammar, ASTType} from "../../../../editor/lang/ast/ASTGrammar";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {Token} from "../../../../editor/lang/tokens/Token";
import {Marker} from "../../../../editor/lang/ast/builder/Marker";
import {JsExprParser} from "./JsExprParser";

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
    CALL = 170,
    ACCESS_CALL = 170,
    MEMBER = 170,
    GROUPING = 180,

    /** Used to disallow comma operator in certain contexts */
    NOCOMMA = COMMA + 1,
}

export enum ErrorHandlingMode {
    NONE,
    ROLLBACK,
    ERROR_NODE
}

export class JsPrattParser {
    private static readonly NUD_LITERALS: [TokenType, string | null, ASTType][] = [
        [JsLexicalGrammar.NUMBER_LITERAL, null, JsGrammar.NumberLiteral],
        [JsLexicalGrammar.STRING_LITERAL, null, JsGrammar.StringLiteral],
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
            if (currentErrorMode === ErrorHandlingMode.ROLLBACK) this.builder.error("Expected expression");
            return currentErrorMode;
        }
        while (rbp < this.bindingPower(this.builder.seek())) {
            this.led(exprStart);
        }
        exprStart.done(ASTGrammar.Expression);

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
            this.parseExpression(OperatorPrecedence.NOCOMMA);
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            }
        }

        this.builder.expect(JsLexicalGrammar.RBRACKET).orError("Expected ']'");
        this.parser.setIsSpreadAllowed(oldSpreadAllowed);

        start.done(JsGrammar.ArrayLiteral);
    }

    parseObjectLiteral(start: Marker) {
        // TODO
    }

    tryParseGroupingOrArrowFunction(start: Marker) {
        // TODO
        this.parseExpression();
        this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
        start.done(JsGrammar.GroupExpr);
    }

    tryParseIdentifierOrArrowFunction(start: Marker) {
        // TODO
        return start.done(JsGrammar.Identifier);
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

    private nud(): ErrorHandlingMode {
        const start = this.builder.mark();
        const token = this.builder.advance();
        if (!token) {
            this.builder.error("Unexpected end of input");
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
        } else if (type === JsLexicalGrammar.KEYWORD) {
            this.parseKeywordNud(value, start);
        } else if (type === JsLexicalGrammar.LPAREN) {
            this.tryParseGroupingOrArrowFunction(start);
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
                this.parseExpression(OperatorPrecedence.NEW);
                start.done(JsGrammar.NewExpr);
                break;
            case "import":
                this.myExprParser.parseImportExpression(start);
                break;
            case "super":
                this.myExprParser.parseSuperExpression(start);
                break;
            case "async":
                // TODO
                break;
            case "yield":
                this.myExprParser.parseYieldExpression(start);
                break;
            case "await":
                this.myExprParser.parseAwaitExpression(start);
                break;
            default:
                this.builder.popAndError(`Unexpected keyword '${value}'`);
                break;
        }
    }

    private led(marker: Marker) {
        const token = this.builder.advance();
        if (!token) {
            this.builder.error("Unexpected end of input");
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
            this.parseExpression(OperatorPrecedence.TERNARY);
            marker.done(JsGrammar.TernaryExpr);
            return;
        } else if (type === JsLexicalGrammar.ASSIGNMENT_OPERATOR) {
            const bp = this.bindingPower(token);
            this.parseExpression(bp - 1); // Right associative
            marker.done(JsGrammar.AssignmentExpr);
            return;
        } else if (type === JsLexicalGrammar.DOT) {
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
        } else if (type === JsLexicalGrammar.KEYWORD && token.getValue() === "instanceof" || token.getValue() === "in") {
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
            return OperatorPrecedence.POSTFIX;
        } else if (type === JsLexicalGrammar.KEYWORD) {
            if (token.getValue() === "instanceof" || token.getValue() === "in") {
                return OperatorPrecedence.INSTANCEOF_IN;
            }
            if (token.getValue() === "new") {
                return OperatorPrecedence.NEW;
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