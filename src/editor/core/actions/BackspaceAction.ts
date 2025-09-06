import {Key} from "../events/keybind";
import {Editor} from "../../Editor";
import {AbstractAction} from "./AbstractAction";
import {CtrlMoveHelper} from "./utils/CtrlMoveHelper";


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
            if (caret.getSelectionModel().isSelectionActive) editor.deleteSelection(caret);
            else {
                caret.shift(-1);
                editor.deleteAt(caret.getOffset());
            }
        });
        editor.view.resetBlink();
    }
}

/*
* let x;;;
*
* */

export class CtrlBackspaceAction extends AbstractAction {

    name = 'Ctrl+Backspace';
    description = 'Delete the word before the caret position.';

    keybinding = {
        key: Key.BACKSPACE,
        ctrl: true,
        alt: false,
        shift: false
    }

    run(editor: Editor, event: KeyboardEvent) {
        editor.caretModel.forEachCaret(caret => {
            if (caret.getSelectionModel().isSelectionActive) editor.deleteSelection(caret);
            else {
                const offset = CtrlMoveHelper.getOffsetToPreviousWord(editor.getOpenedDocument(), caret.getOffset(), CtrlMoveHelper.DELIMITER);
                caret.shift(offset);
                editor.deleteAt(caret.getOffset(), -offset);
            }

            editor.view.triggerRepaint();
        });
        editor.view.resetBlink();
    }
}