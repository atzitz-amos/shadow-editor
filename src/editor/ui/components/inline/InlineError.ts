import {TextRange} from "../../../core/coordinate/TextRange";
import {MessageBox} from "./popup/MessageBox";
import {Popup, PopupBuilder} from "./popup/Popup";
import {Markdown} from "../markdown/Parser"
import {InlineComponent} from "../../../core/components/InlineComponent";
import {Registry} from "../../../core/Registry";


export class InlineError extends InlineComponent implements PopupBuilder {
    name = "inline-error";

    className = "js-error-marker";
    content = null;
    msg: string;
    range: TextRange;

    private timeoutId: any;

    constructor(range: TextRange, errType: string, errValue: string, errMsg: string) {
        super();

        this.range = range.cloneNotTracked();
        this.className += " " + errType;
        this.msg = errMsg;
    }

    onceRendered() {
        this.view!.addEventListener("mouseenter", e => {
            this.timeoutId = setTimeout(() => {
                if (this.view?.isInBound(e.x, e.y, 2)) {
                    this.view!.getEditor().openPopup(e.x, e.y, Registry.getPopup(this));
                }
            }, 600);
        });

        this.view!.addEventListener("mouseleave", e => {
            if (this.timeoutId)
                clearTimeout(this.timeoutId);
        });
    }

    createPopup(): Popup {
        return new MessageBox(this, Markdown.parse(this.msg));
    }
}