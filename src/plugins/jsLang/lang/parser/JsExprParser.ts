import {JsParser} from "./JsParser";
import {ASTBuilder} from "../../../../editor/lang/ast/builder/ASTBuilder";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {JsGrammar} from "./JsGrammar";
import {JsPrattParser} from "./JsPrattParser";

export class JsExprParser {
    private myPrattParser: JsPrattParser;

    constructor(private parser: JsParser, private builder: ASTBuilder) {
        this.myPrattParser = new JsPrattParser(parser, builder);
    }

    parseParameterDeclaration(): void {
        if (this.tryParseDestructuringPattern()) {
            // done in tryParseDestructuringPattern
        } else {
            this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);
            this.builder.expect(JsLexicalGrammar.IDENTIFIER).orError("Expected parameter name");
        }
        if (this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
            this.parseExpression();
        }
    }

    parseExpression(): void {
        this.myPrattParser.parseExpression();
    }

    parseDestructuringListPattern(): void {
        const start = this.builder.mark();
        this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);
        this.builder.advance(); // consume '['
        while (!this.builder.done() && !this.builder.isNext(JsLexicalGrammar.RBRACKET)) {
            if (this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                this.builder.add(JsGrammar.EmptyCommaExpr);
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
            if (this.builder.consumeIf(JsLexicalGrammar.COMMA)) {
                this.builder.add(JsGrammar.EmptyCommaExpr);
                continue;
            }
            this.builder.consumeIf(JsLexicalGrammar.ELLIPSIS);

            const propKeyStart = this.builder.mark();
            let isIdentifierKey = false;
            if (this.builder.isNext(JsLexicalGrammar.LBRACKET)) {
                this.builder.advance(); // consume '['
                this.parseExpression();
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
            let propValueStart = this.builder.mark();

            if (this.builder.consumeIf(JsLexicalGrammar.COLON)) {
                this.parseParameterDeclaration();
            } else if (isIdentifierKey) {
                // Shorthand property
                if (this.builder.consumeIf(JsLexicalGrammar.ASSIGNMENT_OPERATOR, "=")) {
                    this.parseExpression();
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
}

