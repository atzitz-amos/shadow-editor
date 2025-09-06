import {View} from "../../../View";
import {Popup} from "./Popup";
import {MarkdownMessage} from "../../markdown/Message";
import {InlineComponent} from "../../../../core/components/InlineComponent";


export class MessageBox extends Popup {
    name: string = "message-box";

    msg: MarkdownMessage;

    constructor(owner: InlineComponent, msg: MarkdownMessage) {
        super(owner);

        this.msg = msg;
    }

    render(view: View): HTMLDivElement {
        this.element = document.createElement("div");
        this.element.className = "editor-popup popup-message-box md";

        let children = this.msg.toHTML();
        for (let child of children) {
            this.element.appendChild(child);
        }

        this.isRendered = true;
        return this.element;
    }
}