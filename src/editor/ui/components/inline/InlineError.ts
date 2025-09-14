import {TextRange} from "../../../core/coordinate/TextRange";
import {MessageBox} from "./popup/MessageBox";
import {Popup, PopupBuilder} from "./popup/Popup";
import {Markdown} from "../markdown/Parser"
import {InlineComponent} from "../../../core/components/InlineComponent";
import {Registry} from "../../../core/Registry";


export class InlineError extends InlineComponent implements PopupBuilder {
    name = "inline-error";

    className = "js-error-marker";
    content: string | null = null;
    msg: string;
    range: TextRange;

    constructor(range: TextRange, errType: string, errValue: string, errMsg: string) {
        super();

        this.range = range.cloneNotTracked();
        this.className += " " + errType;
        this.msg = errMsg;
    }

    onceRendered() {
        this.view!.addEventListener("mouseover", e => {
            setTimeout(() => {
                if (this.view?.isInBound(e.x, e.y, 2)) {
                    this.view!.getEditor().openPopup(e.x, e.y, Registry.getPopup(this));
                }
            }, 800);
        });
    }

    createPopup(): Popup {
        return new MessageBox(this, Markdown.parse(this.msg));
    }
}