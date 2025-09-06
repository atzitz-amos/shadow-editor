import {VisitorHighlighter, VisitorHighlighterImplementor} from "../../core/lang/highlighter/IHighlighter";
import {JS} from "./jsLexer";
import {Token} from "../../core/lang/lexer/TokenStream";
import {HighlightedToken} from "../../core/lang/highlighter/HighlightedToken";

export class JSHighlighter extends VisitorHighlighter<JS> implements VisitorHighlighterImplementor<JS> {
    _impl = this;

    visitEqualOp(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-operator");
    }

    visitCompareOp(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-operator");
    }

    visitArrow(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-operator");
    }

    visitUnOperator(token: Token<JS>) {
        return new HighlightedToken(token, "js-operator");
    }

    visitIncrDecrOp = (token: Token<JS>) => {
        return new HighlightedToken(token, "js-operator");
    };

    visitString(token: Token<JS>) {
        return new HighlightedToken(token, "js-string");
    }

    visitIdentifier(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-identifier");
    }

    visitNumber(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-number");
    }

    visitPunctuation(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-default");
    }

    visitLeftParen(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-left-paren js-default");
    }

    visitRightParen(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-right-paren js-default");
    }

    visitLeftBrace(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-left-brace js-default");
    }

    visitRightBrace(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-right-brace js-default");
    }

    visitLeftBracket(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-left-bracket js-default");
    }

    visitRightBracket(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-right-bracket js-default");
    }

    visitOperator(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-operator");
    }

    visitEquals(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-operator");
    }

    visitEOL(token: Token<JS>): HighlightedToken | null {
        return null;  // We skip EOL tokens
    }

    visitEOF(token: Token<JS>): HighlightedToken | null {
        return null;  // We skip EOF tokens
    }

    visitSyntaxError(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-syntax-error");
    }

    visitKeyword(token: Token<JS>): HighlightedToken | null {
        return new HighlightedToken(token, "js-keyword");
    }
}