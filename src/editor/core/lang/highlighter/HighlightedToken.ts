import {InlineComponent} from "../../../ui/components/Inline";
import {TextRange} from "../../Position";
import {Token} from "../lexer/TokenStream";
import {View} from "../../../ui/View";

export interface IHighlightedToken extends InlineComponent {

}

export class HighlightedToken implements IHighlightedToken {
    range: TextRange;
    element: HTMLSpanElement | null = null;

    className: string;
    content: string;

    constructor(token: Token<any>, className: string) {
        this.content = token.value;
        this.range = token.range.clone();
        this.className = "editor-ht " + className;
    }

    render(): HTMLElement {
        throw new Error("Method not implemented. Use `data.edac.toRenderable()` instead.");
    }

    update(): void {
        throw new Error("Method not implemented. Use `data.edac.update()` instead.");
    }

    destroy(): void {
        throw new Error("Method not implemented.");
    }

    getWidth(view: View): number {
        return this.content.length * view.getCharSize();
    }
}