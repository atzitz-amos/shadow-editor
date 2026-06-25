import {Key} from "../../../core/keybinds/Keybind";
import {Editor} from "../../Editor";
import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {EditorDeleteContext} from "../../core/behaviors/context/EditorDeleteContext";


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
            editor.getBehaviorManager().invokeDeleteForward(new EditorDeleteContext(editor, caret, caret.getOffset(), 1));
        });
        editor.getView().resetBlink();
    }
}