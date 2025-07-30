import {Key} from "../events/keybind";
import {Editor} from "../../Editor";
import {AbstractAction} from "./AbstractAction";


export class BackspaceAction extends AbstractAction {
    name = 'Backspace';
    description = 'Delete the selected text or the character at the caret position.';

    keybinding = {
        key: Key.BACKSPACE,
        ctrl: false,
        alt: false,
        shift: false
    }

    run(editor: Editor, event: KeyboardEvent) {
        editor.caretModel.forEachCaret(caret => {
            if (caret.selectionModel.isSelectionActive) editor.deleteSelection(caret);
            else {
                editor.deleteAt(caret.position.offset - 1);
                caret.shift(-1);
            }
        });
        editor.view.resetBlink();
    }
}
