import {AbstractDialog, IdeResultDialog} from "../IdeDialog";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {Icon} from "../../../icons/Icon";

/**
 *
 * @author Atzitz Amos
 * @date 6/17/2026
 * @since 1.0.0
 */
export class SimpleTextInputDialog extends AbstractDialog implements IdeResultDialog<string> {
    private readonly popupElement: HTMLElement = HTMLUtils.createDiv("simple-text-input-popup");

    constructor(title: string, placeholder: string, icon: Icon | null = null) {
        super();

        const titleElement = HTMLUtils.createDiv("popup-title", this.popupElement);
        titleElement.innerText = title;

        const bodyElement = HTMLUtils.createDiv("popup-body", this.popupElement);

        if (icon) {
            const iconElement = HTMLUtils.createDiv("popup-icon", bodyElement);
            iconElement.appendChild(icon.toHTML())
        }

        const inputElement = HTMLUtils.createElement("input.popup-input", bodyElement) as HTMLInputElement;
        inputElement.placeholder = placeholder;

        setTimeout(() => inputElement.focus(), 0);
        inputElement.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                if (inputElement.value.trim() !== "") {
                    this.close(false);
                }
            }
        })
    }

    awaitResult(): Promise<string | null> {
        return new Promise<string | null>((resolve, reject) => {
            this.onClose((wasCancelled: boolean) => {
                if (wasCancelled) {
                    resolve(null);
                } else {
                    const inputElement = this.popupElement.querySelector("input.popup-input") as HTMLInputElement;
                    resolve(inputElement.value);
                }
            });
        });
    }

    getPopupElement(): HTMLElement {
        return this.popupElement;
    }
}
