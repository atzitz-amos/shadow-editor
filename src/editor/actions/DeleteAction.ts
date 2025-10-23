import {Key} from "../core/events/Keybind";
import {Editor} from "../Editor";
import {AbstractAction} from "../core/actions/AbstractAction";


export class DeleteAction extends AbstractAction {
    name = 'Delete';
    description = 'Delete the selected text or the character after the caret.';
    defaultKeybinding = {
        key: Key.DELETE,
        ctrl: false,
        alt: false,
        shift: null
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