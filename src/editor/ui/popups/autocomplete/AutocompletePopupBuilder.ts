import {PopupBuilder} from "../builder/PopupBuilder";
import {CodeCompletionItem} from "../../../../lang/codeCompletion/item/CodeCompletionItem";
import {Editor} from "../../../Editor";
import {EditorInlinePopup} from "../EditorInlinePopup";
import {AutocompletePopup} from "./AutocompletePopup";

/**
 *
 * @author Atzitz Amos
 * @date 10/26/2026
 * @since 1.0.0
 */
export class AutocompletePopupBuilder implements PopupBuilder {
    private acceptCallback: null | ((item: CodeCompletionItem | null) => void) = null;

    constructor(private readonly elements: CodeCompletionItem[]) {
    }

    build(editor: Editor): EditorInlinePopup {
        return new AutocompletePopup(editor, this.elements, this.acceptCallback);
    }

    setAcceptCallback(callback: (item: CodeCompletionItem | null) => void) {
        this.acceptCallback = callback;
        return this;
    }
}
