import {JsParser} from "./JsParser";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {JsGrammar} from "./JsGrammar";
import {ErrorHandlingMode, JsPrattParser, OperatorPrecedence} from "./JsPrattParser";
import {ASTBuilder} from "../../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {Marker} from "../../../../lang/syntax/builder/parser/builder/Marker";
import {Stateful} from "../../../../lang/syntax/builder/parser/optimizer/api/Stateful";
import {Token} from "../../../../lang/syntax/builder/tokens/Token";

export class JsExprParser {
    private myPrattParser: JsPrattParser;

    @Stateful private potentiallyInLoop = false;

    constructor(private parser: JsParser, private builder: ASTBuilder) {
        this.myPrattParser = new JsPrattParser(parser, this, builder);
    }

    getPrattParser(): JsPrattParser {
        return this.myPrattParser;
    }

    public setPotentiallyInLoop(value: boolean) {
        this.potentiallyInLoop = value;
    }

    public isPotentiallyInLoop(): boolean {
        return this.potentiallyInLoop;
    }

    parseParameterDeclaration(): Token | null {
        let isRest: Token | null = null;
        if (!this.tryParseDestructuringPattern()) {
            isRest = this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);
            let isValid = this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected parameter name") !== null;
            if (!isValid) {
                this.skipToParameterEnd();
                return null;
            }
        }
        if (this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
            if (isRest) {
                this.builder.errorOn(isRest, "Rest parameter cannot have a default value");
            }
            this.parseExpression(false);
        }
        return isRest;
    }

    parseExpression(allowComma = true): void {
        const isError = this.myPrattParser.parseExpression(allowComma ? 0 : OperatorPrecedence.NO_COMMA);
        if (isError === ErrorHandlingMode.ROLLBACK) {
            this.builder.advance(false); // Ensure the parser does not get stuck
            this.builder.errorVirtual("Unexpected token");
        }
    }

    parseDestructuringListPattern(): void {
        this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);
        const start = this.builder.mark();
        this.builder.advance(); // consume '['

        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACKET)) {
            if (this.builder.isNext(JsLexicalGrammar.COMMA)) {
                this.builder.add(JsGrammar.EmptyCommaExpr);
                this.builder.advance();
                continue;
            }
            let lastSpread = this.parseParameterDeclaration();
            if (lastSpread && this.builder.isNext(JsLexicalGrammar.COMMA)) {
                this.builder.errorOn(lastSpread, "Rest parameter must be last in destructuring list pattern");
            }
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            }
        }
        this.builder.expect(JsLexicalGrammar.RBRACKET).orError("Expected ']'");
        start.done(JsGrammar.DestructuringListPattern);
    }

    parseDestructuringObjectPattern(): void {
        this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);
        const start = this.builder.mark();
        this.builder.advance(); // consume '{'
        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACE)) {
            if (this.builder.isNext(JsLexicalGrammar.COMMA)) {
                this.builder.add(JsGrammar.EmptyCommaExpr);
                this.builder.advance();
                continue;
            }
            let restToken = this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);

            const propKeyStart = this.builder.mark();
            let isIdentifierKey = false;
            if (this.builder.isNext(JsLexicalGrammar.LBRACKET)) {
                this.builder.advance(); // consume '['
                this.parseExpression(false);
                this.builder.expect(JsLexicalGrammar.RBRACKET).orError("Expected ']'");
            } else if (
                this.builder.consumeIf(JsLexicalGrammar.STRING_LITERAL)
                || this.builder.consumeIf(JsLexicalGrammar.NUMBER_LITERAL)
                || this.builder.consumeIf(JsLexicalGrammar.TEMPLATE_STRING)) {
            } else if (this.builder.consumeIf(JsLexicalGrammar.IDENTIFIER)) {
                isIdentifierKey = true;
            } else {
                this.builder.errorVirtual("Expected property name");
                this.builder.advance(false);
            }

            propKeyStart.done(JsGrammar.ObjectPropertyKey);
            let isColonPresent = this.builder.consumeIf(JsLexicalGrammar.COLON);
            let propValueStart = this.builder.mark();

            if (isColonPresent) {
                this.parseParameterDeclaration();
            } else if (isIdentifierKey) {
                // Shorthand property
                this.builder.add(JsGrammar.ObjectPropertyShorthand);
                if (this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
                    this.parseExpression(false);
                }
            } else {
                this.builder.errorVirtual("Expected ':' after property name");
            }
            propValueStart.done(JsGrammar.ObjectPropertyValue);
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            } else if (restToken) {
                this.builder.errorOn(restToken, "Rest property must be last in destructuring object pattern");
            }
        }
        this.builder.expect(JsLexicalGrammar.RBRACE).orError("Expected '}'");

        start.done(JsGrammar.DestructuringObjectPattern);
    }

    isDestructuringListPattern(): boolean {
        if (this.builder.isNext(JsLexicalGrammar.ELLIPSIS)) {
            return this.builder.lookAhead(1) !== null && this.builder.lookAhead(1)!.isType(JsLexicalGrammar.LBRACKET);
        }
        return this.builder.isNext(JsLexicalGrammar.LBRACKET);
    }

    isDestructuringObjectPattern(): boolean {
        if (this.builder.isNext(JsLexicalGrammar.ELLIPSIS)) {
            return this.builder.lookAhead(1) !== null && this.builder.lookAhead(1)!.isType(JsLexicalGrammar.LBRACE);
        }
        return this.builder.isNext(JsLexicalGrammar.LBRACE);
    }

    tryParseDestructuringPattern(): boolean {
        if (this.isDestructuringObjectPattern()) {
            this.parseDestructuringObjectPattern();
        } else if (this.isDestructuringListPattern()) {
            this.parseDestructuringListPattern();
        } else {
            return false;
        }
        return true;
    }

    parseFunctionParameterListDeclaration(): void {
        const marker = this.builder.mark();
        const old = this.parser.isInGenerator();
        this.parser.setInGenerator(false);

        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RPAREN)) {
            const argumentMarker = this.builder.mark();
            let spread = this.parseParameterDeclaration();
            argumentMarker.done(JsGrammar.FunctionParameter);
            if (spread && this.builder.isNext(JsLexicalGrammar.COMMA)) {
                this.builder.errorOn(spread, "Rest parameter must be last in parameter list");
            }
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            }
        }

        this.parser.setInGenerator(old);

        marker.done(JsGrammar.FunctionParameterList);
    }

    parseVariableDeclarator() {
        const marker = this.builder.mark();

        if (this.tryParseDestructuringPattern()) {
            if (this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
                this.parseExpression(false);
            }
        } else {
            let isValid = this.builder.expect(JsLexicalGrammar.IDENTIFIER).failWith("Expected variable name").isValid();
            if (isValid && this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
                this.parseExpression(false);
            }
        }
        marker.done(JsGrammar.VariableDeclarator);
    }

    parseFunctionExpression(start: Marker, isAsync = false) {
        if (isAsync) this.builder.expect(JsLexicalGrammar.KEYWORD, "function").orError("Expected 'function'");
        const isGenerator = !!this.builder.consumeIf(JsLexicalGrammar.MATHEMATICAL_OPERATOR, "*");

        if (this.builder.isNext(JsLexicalGrammar.IDENTIFIER)) {
            this.builder.advance(); // consume function name
        }

        this.builder.expect(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.parseFunctionParameterListDeclaration());
        this.builder.expect(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(() => this.parser.parseBlock(true, true, isAsync, isGenerator));

        start.done(JsGrammar.FunctionExpression);
    }

    parseClassExpression(start: Marker) {
        if (this.builder.isNext(JsLexicalGrammar.IDENTIFIER)) {
            this.builder.advance(); // consume class name
        }
        if (this.builder.consumeIf(JsLexicalGrammar.KEYWORD, "extends")) {
            this.parseExpression(false);
        }
        this.builder.expect(JsLexicalGrammar.LBRACE).failWith("Expected '{'")
            .then(() => this.parser.parseClassBody())
            .then(JsLexicalGrammar.RBRACE).failWith("Expected '}'");
        start.done(JsGrammar.ClassExpression);
    }

    parseImportExpression(start: Marker) {
        // TODO
    }

    parseSuperExpression(start: Marker) {
        if (this.builder.isNext(JsLexicalGrammar.LPAREN)) {
            this.builder.advance(); // consume '('
            this.myPrattParser.parseFunctionArguments();
            this.builder.expect(JsLexicalGrammar.RPAREN).orError("Expected ')'");
            start.done(JsGrammar.CallExpr);
        } else if (this.builder.consumeIf(JsLexicalGrammar.DOT)) {
            const propMarker = this.builder.mark();
            this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected property name");
            propMarker.done(JsGrammar.ObjectPropertyKey);
            start.done(JsGrammar.MemberAccessExpr);
        } else if (this.builder.consumeIf(JsLexicalGrammar.LBRACKET)) {
            this.parseExpression();
            this.builder.expect(JsLexicalGrammar.RBRACKET).orError("Expected ']'");
            start.done(JsGrammar.ArrayAccessExpr);
        } else {
            this.builder.popAndError("'super' must be followed by '(' or '.' or '['");
        }
    }

    /**
     * Error recovery for an invalid parameter: skips to the next `,` or to the bracket closing the enclosing list.
     * Bracketed groups are skipped whole, so that in `(1, ()=>{})` the inner `)` isn't taken for the end of the list
     * (which would make `tryParseGroupingOrArrowFunction` see `) =>` and parse an arrow function).
     */
    private skipToParameterEnd() {
        let depth = 0;
        while (!this.builder.done()) {
            if (this.builder.isNext(JsLexicalGrammar.LPAREN) || this.builder.isNext(JsLexicalGrammar.LBRACKET) || this.builder.isNext(JsLexicalGrammar.LBRACE)) {
                depth++;
            } else if (this.builder.isNext(JsLexicalGrammar.RPAREN) || this.builder.isNext(JsLexicalGrammar.RBRACKET) || this.builder.isNext(JsLexicalGrammar.RBRACE)) {
                if (depth === 0) return;
                depth--;
            } else if (depth === 0 && this.builder.isNext(JsLexicalGrammar.COMMA)) {
                return;
            }
            this.builder.advance(false);
        }
    }
}
