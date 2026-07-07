import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {KeybindContextDescriptor} from "../../../core/keybinds/context/KeybindContextDescriptor";
import {Key, ModifierKeyHolder} from "../../../core/keybinds/Keybind";
import {EditorBehaviorContext} from "../../core/behaviors/context/EditorBehaviorContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class EnterAction extends AbstractAction {
    getName(): string {
        return "Enter";
    }

    getDescription(): string {
        return "Inserts a new line at the current cursor position.";
    }

    getDefaultKeybinding() {
        return {
            key: Key.ENTER,
            ctrl: null,
            shift: null,
            alt: false
        };
    }

    getKeybindContext(): KeybindContextDescriptor {
        return KeybindContextDescriptor.IN_MAIN_EDITOR;
    }

    run(ctx: KeybindContext): void {
        const editor = ctx.requireEditor();

        editor.getCaretModel().forEachCaret(caret => {
            editor.getBehaviorManager().invokeEnterPressed(new EditorBehaviorContext(editor, caret));
        });
        editor.getView().resetBlink();


        ModifierKeyHolder.getInstance().clear();
    }

}
