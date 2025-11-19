import {JsParser} from "./JsParser";
import {ASTBuilder} from "../../../../core/lang/ast/builder/ASTBuilder";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {JsGrammar} from "./JsGrammar";
import {ErrorHandlingMode, JsPrattParser, OperatorPrecedence} from "./JsPrattParser";
import {Marker} from "../../../../core/lang/ast/builder/Marker";

export class JsExprParser {
    private myPrattParser: JsPrattParser;

    constructor(private parser: JsParser, private builder: ASTBuilder) {
        this.myPrattParser = new JsPrattParser(parser, this, builder);
    }

    parseParameterDeclaration(): void {
        if (this.tryParseDestructuringPattern()) {
            // done in tryParseDestructuringPattern
        } else {
            this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);
            let isValid = this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected parameter name") !== null;
            if (!isValid) {
                for (; !this.builder.done() && !this.builder.isNext(JsLexicalGrammar.COMMA) && !this.builder.isNext(JsLexicalGrammar.RPAREN);) {
                    this.builder.advance(false);
                }
                return;
            }
        }
        if (this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
            this.parseExpression(false);
        }
    }

    parseExpression(allowComma = true): void {
        const isError = this.myPrattParser.parseExpression(allowComma ? 0 : OperatorPrecedence.NOCOMMA);
        if (isError === ErrorHandlingMode.ROLLBACK) {
            this.builder.advance(false); // Ensure the parser does not get stuck
            this.builder.error("Unexpected token");
        }
    }

    parseDestructuringListPattern(): void {
        const start = this.builder.mark();
        this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);
        this.builder.advance(); // consume '['
        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACKET)) {
            if (this.builder.isNext(JsLexicalGrammar.COMMA)) {
                this.builder.add(JsGrammar.EmptyCommaExpr);
                this.builder.advance();
                continue;
            }
            this.parseParameterDeclaration();
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            }
        }
        this.builder.expect(JsLexicalGrammar.RBRACKET).orError("Expected ']'");
        start.done(JsGrammar.DestructuringListPattern);
    }

    parseDestructuringObjectPattern(): void {
        const start = this.builder.mark();
        this.builder.advance(); // consume '{'
        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACE)) {
            if (this.builder.isNext(JsLexicalGrammar.COMMA)) {
                this.builder.add(JsGrammar.EmptyCommaExpr);
                this.builder.advance();
                continue;
            }
            this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);

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
                this.builder.error("Expected property name");
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
                this.builder.error("Expected ':' after property name");
            }
            propValueStart.done(JsGrammar.ObjectPropertyValue);
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
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

    parseFunctionArgumentDeclaration(): void {
        const marker = this.builder.mark();

        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RPAREN)) {
            const argumentMarker = this.builder.mark();
            this.parseParameterDeclaration();
            argumentMarker.done(JsGrammar.FunctionArgument);
            if (!this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                break;
            }
        }

        marker.done(JsGrammar.FunctionArguments);
    }

    parseVariableDeclarator() {
        const marker = this.builder.mark();

        let isValid = this.builder.expect(JsLexicalGrammar.IDENTIFIER).failWith("Expected variable name").isValid();
        if (isValid && this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
            this.parseExpression(false);
        }
        marker.done(JsGrammar.VariableDeclarator);
    }

    parseFunctionExpression(start: Marker, isAsync = false) {
        if (isAsync) this.builder.expect(JsLexicalGrammar.KEYWORD, "function").orError("Expected 'function'");
        const isGenerator = !!this.builder.consumeIf(JsLexicalGrammar.MATHEMATICAL_OPERATOR, "*");

        if (this.builder.isNext(JsLexicalGrammar.IDENTIFIER)) {
            this.builder.advance(); // consume function name
        }

        const oldIsInFunction = this.parser.isInFunction();
        const oldIsAsyncAllowed = this.parser.isAsyncAllowed();
        const oldIsInGenerator = this.parser.isInGenerator();

        this.parser.setInFunction(true);
        this.parser.setInAsync(isAsync);
        this.parser.setInGenerator(isGenerator);

        this.builder.expect(JsLexicalGrammar.LPAREN).failWith("Expected '('")
            .then(() => this.parseFunctionArgumentDeclaration())
            .then(JsLexicalGrammar.RPAREN).failWith("Expected ')'")
            .then(() => this.parser.parseBlock(true));

        this.parser.setInFunction(oldIsInFunction);
        this.parser.setInAsync(oldIsAsyncAllowed);
        this.parser.setInGenerator(oldIsInGenerator);
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

    parseYieldExpression(start: Marker) {
        const token = this.builder.lookBehind();

        if (!this.parser.insertSemicolonIfNeeded()) {
            this.parseExpression();
        }
        start.done(JsGrammar.YieldStatement);

        if (!this.parser.isInGenerator()) {
            this.builder.errorOn(token!, "'yield' used outside of a generator function");
        }
    }

    parseAwaitExpression(start: Marker) {
        const token = this.builder.lookBehind(); // get 'await'
        if (!this.parser.insertSemicolonIfNeeded()) {
            this.parseExpression();
        }
        start.done(JsGrammar.AwaitStatement);
        if (!this.parser.isAsyncAllowed()) {
            this.builder.errorOn(token!, "'await' used outside of an async function");
        }
    }
}

