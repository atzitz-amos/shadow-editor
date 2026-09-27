import {Editor} from "../../../Editor";
import {PopupBuilder} from "../builder/PopupBuilder";
import {EditorInlinePopup} from "../EditorInlinePopup";
import {ContextActionsPopup} from "./ContextActionsPopup";
import {Describable} from "../../../../core/ui/api/Describable";


/**
 *
 * @author Atzitz Amos
 * @date 9/19/2026
 * @since 1.0.0
 */
export class ContextActionPopupBuilder<T extends Describable> implements PopupBuilder {
    private actionChosenCallback: ((selected: T | null) => void) | null = null;

    constructor(private readonly elements: T[]) {
    }

    public setOnActionChosen(callback: (selected: T | null) => void): ContextActionPopupBuilder<T> {
        this.actionChosenCallback = callback;
        return this;
    }

    build(editor: Editor): EditorInlinePopup {
        const popup = new ContextActionsPopup(editor, this.elements);
        if (this.actionChosenCallback) popup.setOnActionChosen(this.actionChosenCallback);
        return popup;
    }
}
