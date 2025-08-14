import {InlineComponent} from "../../../ui/components/inline/Inline";
import {TextRange} from "../../Position";
import {Token} from "../lexer/TokenStream";
import {View} from "../../../ui/View";
import {Registry} from "../../Registry";
import {Editor} from "../../../Editor";

export interface IHighlightedToken extends InlineComponent {

}

export class HighlightedToken implements IHighlightedToken {
    id: string;

    range: TextRange;
    element: HTMLSpanElement | null = null;

    className: string;
    content: string;

    constructor(token: Token<any>, className: string) {
        this.id = Registry.getComponentId("highlighted-token");

        this.content = token.value;
        this.range = token.range.clone();
        this.className = "editor-ht " + className;
    }

    onDestroy(editor: Editor): void {
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

    onRender(editor: Editor, element: HTMLSpanElement) {
    };
}