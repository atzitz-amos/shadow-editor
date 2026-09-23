import {AbstractDialog} from "../IdeDialog";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 8/29/2026
 * @since 1.0.0
 */
export class ActionPopup extends AbstractDialog {
    private readonly popupElement: HTMLElement = HTMLUtils.createDiv("action-popup");

    constructor(title: string) {
        super();

        const titleElement = HTMLUtils.createDiv("popup-title", this.popupElement);
        titleElement.innerText = title;

        const bodyElement = HTMLUtils.createDiv("popup-body", this.popupElement);
    }

    protected getPopupElement(): HTMLElement {
        return this.popupElement;
    }
}
