import {TextRange} from "../../../core/Position";
import {InlineComponent} from "./Inline";
import {Registry} from "../../../core/Registry";
import {MessageBox} from "./popup/MessageBox";
import {Popup, PopupBuilder} from "./popup/Popup";
import {Markdown} from "../markdown/Parser"
import {Editor} from "../../../Editor";


export class InlineError implements InlineComponent, PopupBuilder {
    id: string;

    element: HTMLElement;

    className = "js-error-marker";
    content: string;
    msg: string;
    range: TextRange;

    constructor(range: TextRange, errType: string, errValue: string, errMsg: string) {
        this.id = Registry.getComponentId("inline-error")

        this.range = range;
        this.className += " " + errType;
        this.content = errValue;
        this.msg = errMsg;

        let length = range.end - range.begin - this.content.length;
        if (length > 0)
            this.content += ' '.repeat(length);
    }

    onDestroy(editor: Editor): void {
    }

    onRender(editor: Editor, element: HTMLSpanElement) {
        this.element = element;

        element.addEventListener("mouseover", e => {
            editor.openPopup(e.x, e.y, Registry.getPopup(this));
        });

        element.addEventListener("click", () => {
        });
    }

    createPopup(): Popup {
        return new MessageBox(this, Markdown.parse(this.msg));
    }
}