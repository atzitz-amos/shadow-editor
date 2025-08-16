import {TextRange} from "../../../core/Position";
import {Editor} from "../../../Editor";
import {InlineComponent} from "./Inline";
import {View} from "../../View";
import {Registry} from "../../../core/Registry";
import {HTMLUtils} from "../../../utils/HTMLUtils";

export class InlineHint implements InlineComponent {
    id: string;

    className: string = "";
    content: string;
    msg:string;
    range: TextRange;
    element?: HTMLElement | null | undefined;

    constructor(pos: Offset, content: string) {
        this.id = Registry.getComponentId("inline-hint");

        this.msg = content;
        this.range = new TextRange(pos, pos + 1);
    }

    getAddedWidth(view: View) {
        return this.element ? this.element.getBoundingClientRect().width : 0;
    }


    onRender(editor: Editor, element: HTMLSpanElement): void {
    }

    onDestroy(editor: Editor): void {
    }

    shouldBeReplacedWidth(): HTMLSpanElement {
        this.element = HTMLUtils.createElement("span.inline-hint");
        this.element.innerText = this.msg;
        return this.element;
    }
}