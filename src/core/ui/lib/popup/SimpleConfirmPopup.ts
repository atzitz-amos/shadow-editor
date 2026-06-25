import {AbstractPopup, IdeResultPopup} from "./IdePopup";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 6/18/2026
 * @since 1.0.0
 */
export class SimpleConfirmPopup extends AbstractPopup implements IdeResultPopup<boolean> {
    private readonly element: HTMLElement;

    constructor(title: string, message: string) {
        super();

        this.element = HTMLUtils.createDiv("simple-confirm-popup");

        const iconElement = HTMLUtils.createDiv("popup-icon", this.element);
        iconElement.innerHTML = `<i class="fa-solid fa-question"></i>`;

        const popupBody = HTMLUtils.createDiv("popup-body", this.element);

        const titleElement = HTMLUtils.createDiv("popup-title", popupBody);
        titleElement.innerText = title;

        const messageElement = HTMLUtils.createDiv("popup-message", popupBody);
        messageElement.innerText = message;

        const buttonsContainer = HTMLUtils.createDiv("popup-buttons", popupBody);

        buttonsContainer.innerHTML = `<ide-button secondary>Cancel</ide-button><ide-button primary>Confirm</ide-button>`;

        const cancelButton = this.element.querySelector("ide-button[secondary]") as HTMLElement;
        const confirmButton = this.element.querySelector("ide-button[primary]") as HTMLElement;

        cancelButton.addEventListener("click", () => {
            this.close(true);
        });

        confirmButton.addEventListener("click", () => {
            this.close(false);
        });

        this.element.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") {
                cancelButton.focus();
                e.preventDefault();
            } else if (e.key === "ArrowRight") {
                confirmButton.focus();
                e.preventDefault();
            } else if (e.key === "Tab") {
                if (document.activeElement === cancelButton.querySelector(".ide-btn")) {
                    confirmButton.focus();
                } else {
                    cancelButton.focus();
                }
                e.preventDefault();
            }
        })

        requestAnimationFrame(() => {
            confirmButton.focus();
        });
    }

    awaitResult(): Promise<boolean | null> {
        return new Promise<boolean | null>((resolve, reject) => {
            this.onClose((wasCancelled: boolean) => {
                resolve(!wasCancelled);
            });
        });
    }

    getResult(): boolean | null {
        return null;
    }

    protected getPopupElement(): HTMLElement {
        return this.element;
    }

}
