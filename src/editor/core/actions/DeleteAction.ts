import {Key} from "../events/keybind";
import {Editor} from "../../Editor";
import {AbstractAction} from "./AbstractAction";


export class DeleteAction extends AbstractAction {
    name = 'Delete';
    description = 'Delete the selected text or the character after the caret.';
    keybinding = {
        key: Key.DELETE,
        ctrl: false,
        alt: false,
        shift: false
    };

    run(editor: Editor, event: KeyboardEvent): void {
        editor.caretModel.forEachCaret(caret => {
            if (caret.selectionModel.isSelectionActive) editor.deleteSelection(caret);
            else if (!caret.isBeforeInlay()) editor.deleteAt(caret.getOffset());
            else caret.shiftRight();
        });
        editor.view.resetBlink();
    }
}