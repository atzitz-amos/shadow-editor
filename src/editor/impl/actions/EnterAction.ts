import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {KeybindContextDescriptor} from "../../../core/keybinds/context/KeybindContextDescriptor";
import {Key, ModifierKeyHolder} from "../../../core/keybinds/Keybind";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class EnterAction extends AbstractAction {
    id = "Enter";
    description = "Inserts a new line at the current cursor position.";

    defaultKeybinding = {
        key: Key.ENTER,
        ctrl: null,
        shift: null,
        alt: false
    }
    keybindContext = KeybindContextDescriptor.IN_MAIN_EDITOR;

    run(ctx: KeybindContext): void {
        const editor = ctx.requireEditor();
        
        editor.getCaretModel().forEachCaret(caret => {
            const line = editor.getOpenedDocument().getLineAt(caret.getOffset());
            let indent = 0;
            if (line) {
                indent = line.getText().match(/^\s*/)?.[0].length || 0;
                indent = Math.min(indent, caret.getLogical().col);
            }

            editor.typeForCaret(caret, "\n" + " ".repeat(indent), !ModifierKeyHolder.isCtrlPressed());
        });
        editor.getView().resetBlink();


        ModifierKeyHolder.getInstance().clear();
    }

}
