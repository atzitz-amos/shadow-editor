import {Key} from "../../core/keybinds/Keybind";
import {AbstractAction} from "../../core/actions/AbstractAction";
import {CtrlMoveHelper} from "./utils/CtrlMoveHelper";
import {KeybindContext} from "../../core/keybinds/context/KeybindContext";


export class BackspaceAction extends AbstractAction {
    name = 'Backspace';
    description = 'Delete the selected text or the character at the caret position.';

    defaultKeybinding = {
        key: Key.BACKSPACE,
        ctrl: false,
        alt: false,
        shift: false
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.caretModel.forEachCaret(caret => {
            if (caret.getSelectionModel().isSelectionActive) editor.deleteSelection(caret);
            else {
                caret.shiftLeft();
                if (!caret.isBeforeInlay())
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

    defaultKeybinding = {
        key: Key.BACKSPACE,
        ctrl: true,
        alt: false,
        shift: false
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.caretModel.forEachCaret(caret => {
            if (caret.getSelectionModel().isSelectionActive) editor.deleteSelection(caret);
            else {
                const offset = CtrlMoveHelper.getOffsetToPreviousWord(editor.getOpenedDocument(), caret.getOffset(), CtrlMoveHelper.DELIMITER);
                caret.moveToOffset(caret.getOffset() + offset);
                editor.deleteAt(caret.getOffset(), -offset);
            }

            editor.view.triggerRepaint();
        });
        editor.view.resetBlink();
    }
}