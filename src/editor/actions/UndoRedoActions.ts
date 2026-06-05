import {AbstractAction} from "../../core/actions/AbstractAction";
import {KeybindContext} from "../../core/keybinds/context/KeybindContext";
import {Key, ModifierKeyHolder} from "../../core/keybinds/Keybind";
import {KeybindContextDescriptor} from "../../core/keybinds/context/KeybindContextDescriptor";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class UndoAction extends AbstractAction {
    name = "Undo";
    description = "Undo the last action";

    defaultKeybinding = {
        key: Key.Z,
        ctrl: true,
        alt: false,
        shift: false
    }

    keybindContext = KeybindContextDescriptor.IN_MAIN_EDITOR;

    run(ctx: KeybindContext): void {
        ctx.requireEditor().getUndoRedo().undo();
        ctx.requireEditor().getView().resetBlink();
    }
}

export class RedoAction extends AbstractAction {
    name = "Redo";
    description = "Redo the last action";

    defaultKeybinding = {
        key: Key.Z,
        ctrl: true,
        alt: false,
        shift: true
    }

    keybindContext = KeybindContextDescriptor.IN_MAIN_EDITOR;

    run(ctx: KeybindContext): void {
        ModifierKeyHolder.getInstance().clear();
        ctx.requireEditor().getUndoRedo().redo();
        ctx.requireEditor().getView().resetBlink();
    }
}

