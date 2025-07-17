import {VisitorHighlighter, VisitorHighlighterImplementor} from "../../core/lang/highlight/Highlighter";
import {DefaultTokenType} from "./Lexer";
import {IHighlightedToken} from "../../core/lang/highlight/HighlightedToken";
import {Token} from "../../core/lang/lexer/TokenStream";
import {View} from "../../ui/View";

import {createElement} from "../../utils";

export class DefaultLangHT implements IHighlightedToken {
    token: Token<DefaultTokenType>;

    span: HTMLSpanElement | null = null;

    constructor(token: Token<DefaultTokenType>) {
        this.token = token;
    }

    getWidth(view: View): number {
        return this.token.value.length * view.getCharSize();
    }

    getRange(): [Offset, Offset] {
        return [this.token.start, this.token.end];
    }

    render(): HTMLSpanElement {
        this.span = createElement("span");
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


export class DefaultHighlighter extends VisitorHighlighter<DefaultTokenType, DefaultLangHT> implements VisitorHighlighterImplementor<DefaultTokenType, DefaultLangHT> {
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