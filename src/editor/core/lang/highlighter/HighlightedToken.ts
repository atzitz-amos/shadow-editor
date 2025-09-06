import {TextRange} from "../../coordinate/TextRange";
import {Token} from "../lexer/TokenStream";
import {InlineComponent} from "../../components/InlineComponent";

export interface IHighlightedToken {

}

export class HighlightedToken extends InlineComponent implements IHighlightedToken {
    name = "highlighted-token";

    range: TextRange;
    element: HTMLSpanElement | null = null;

    className: string;
    content: string;

    constructor(token: Token<any>, className: string) {
        super();

        this.content = token.value;
        this.range = token.range.cloneNotTracked();
        this.className = "editor-ht " + className;
    }
}