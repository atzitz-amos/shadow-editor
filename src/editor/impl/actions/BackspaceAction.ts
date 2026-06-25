import {Key} from "../../../core/keybinds/Keybind";
import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {EditorDeleteContext} from "../../core/behaviors/context/EditorDeleteContext";


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

        editor.getCaretModel().forEachCaret(caret => {
            if (caret.getSelectionModel().isSelectionActive)
                editor.getBehaviorManager()
                    .invokeDeleteBackward(new EditorDeleteContext(editor, caret, caret.getSelectionModel().getStartOffset()!, caret.getSelectionModel().getSelectionLength()));
            else
                editor.getBehaviorManager()
                    .invokeDeleteBackward(new EditorDeleteContext(editor, caret, caret.getOffset(), -1));
        });
        editor.getView().resetBlink();
    }
}

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

        editor.getCaretModel().forEachCaret(caret => {
            editor.getBehaviorManager().invokeCtrlDelete(new EditorDeleteContext(editor, caret, caret.getOffset(), -1));
        });
        editor.getView().triggerRepaint();
        editor.getView().resetBlink();
    }
}