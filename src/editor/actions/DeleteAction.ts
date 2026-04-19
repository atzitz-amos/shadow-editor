import {Key} from "../../core/keybinds/Keybind";
import {Editor} from "../Editor";
import {AbstractAction} from "../../core/actions/AbstractAction";
import {KeybindContext} from "../../core/keybinds/context/KeybindContext";


export class DeleteAction extends AbstractAction {
    name = 'Delete';
    description = 'Delete the selected text or the character after the caret.';
    defaultKeybinding = {
        key: Key.DELETE,
        ctrl: false,
        alt: false,
        shift: null
    };

    run(ctx: KeybindContext): void {
        const editor: Editor = ctx.requireEditor();

        editor.getCaretModel().forEachCaret(caret => {
            if (caret.selectionModel.isSelectionActive) editor.deleteSelection(caret);
            else if (!caret.isBeforeInlay()) editor.deleteAt(caret.getOffset());
            else caret.shiftRight();
        });
        editor.getView().resetBlink();
    }
}