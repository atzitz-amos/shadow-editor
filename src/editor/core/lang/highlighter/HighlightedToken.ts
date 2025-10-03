import {TextRange} from "../../coordinate/TextRange";
import {InlineComponent} from "../../components/InlineComponent";
import {Token} from "../../../lang/tokens/Token";

export interface IHighlightedToken {

}

export class HighlightedToken extends InlineComponent implements IHighlightedToken {
    name = "highlighted-token";

    range: TextRange;
    element: HTMLSpanElement | null = null;

    className: string;
    content: string;

    constructor(token: Token, className: string) {
        super();

        this.content = token.getRaw();
        this.range = token.getRange().cloneNotTracked();
        this.className = "editor-ht " + className;
    }
}