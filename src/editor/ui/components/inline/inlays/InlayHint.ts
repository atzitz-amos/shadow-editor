import {TextRange} from "../../../../core/coordinate/TextRange";
import {InlayComponent} from "./InlayComponent";

export class InlayHint extends InlayComponent {
    name: string = "inline-hint";
    className: string = "inlay-hint";

    msg: string;
    range: TextRange;

    constructor(pos: Offset, content: string) {
        super();

        this.msg = content;
        this.range = new TextRange(pos, pos + 1);
    }

    getInsertedElement(): HTMLSpanElement {
        const span = document.createElement("span");
        span.className = this.className;
        span.textContent = this.msg;
        return span;
    }
}