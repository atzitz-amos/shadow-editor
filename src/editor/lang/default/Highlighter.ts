import {DefaultTokenType} from "./Lexer";
import {Token} from "../../core/lang/lexer/TokenStream";
import {View} from "../../ui/View";

import {TextRange} from "../../core/Position";
import {IHighlightedToken} from "../../core/lang/highlighter/HighlightedToken";
import {VisitorHighlighter, VisitorHighlighterImplementor} from "../../core/lang/highlighter/IHighlighter";
import {HTMLUtils} from "../../utils/HTMLUtils";

export class DefaultLangHT implements IHighlightedToken {
    token: Token<DefaultTokenType>;
    range: TextRange;

    span: HTMLSpanElement | null = null;

    className = "default-lang-token";
    content: string;


    constructor(token: Token<DefaultTokenType>) {
        this.token = token;
        this.range = token.range.clone();
        this.content = token.value;
    }

    getWidth(view: View): number {
        return this.token.value.length * view.getCharSize();
    }

    render(): HTMLSpanElement {
        this.span = HTMLUtils.createElement("span");
        this.span.textContent = this.token.value;
        return this.span;
    }

    update(): void {

    }

    destroy(): void {
        if (this.span) {
            this.span.remove();
            this.span = null;
        }
    }
}


export class DefaultHighlighter extends VisitorHighlighter<DefaultTokenType> implements VisitorHighlighterImplementor<DefaultTokenType> {
    _impl = this;

    visitEOL(token: Token<DefaultTokenType>): DefaultLangHT | null {
        return null;  // We skip EOL tokens
    }

    visitEOF(token: Token<DefaultTokenType>): DefaultLangHT | null {
        return null;  // We skip EOF tokens
    }

    visitDefault(token: Token<DefaultTokenType>): DefaultLangHT | null {
        return new DefaultLangHT(token);
    }
}