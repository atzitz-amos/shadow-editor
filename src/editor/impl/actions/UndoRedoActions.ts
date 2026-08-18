import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key} from "../../../core/keybinds/Keybind";
import {KeybindContextDescriptor} from "../../../core/keybinds/context/KeybindContextDescriptor";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class UndoAction extends AbstractAction {
    getName(): string {
        return "Undo";
    }

    getDescription(): string {
        return "Undo the last action";
    }

    getDefaultKeybinding() {
        return {
            key: Key.Z,
            ctrl: true,
            alt: false,
            shift: false
        };
    }

    getKeybindContext(): KeybindContextDescriptor {
        return KeybindContextDescriptor.IN_MAIN_EDITOR;
    }

    run(ctx: KeybindContext): void {
        const editor = ctx.requireEditor();
        editor.getOpenedDocument().getUndoRedoStack().undo(editor);
        editor.repaintView();
    }
}

export class RedoAction extends AbstractAction {
    getName(): string {
        return "Redo";
    }

    getDescription(): string {
        return "Redo the last action";
    }

    getDefaultKeybinding() {
        return {
            key: Key.Z,
            ctrl: true,
            alt: false,
            shift: true
        };
    }

    getKeybindContext(): KeybindContextDescriptor {
        return KeybindContextDescriptor.IN_MAIN_EDITOR;
    }

    run(ctx: KeybindContext): void {
        const editor = ctx.requireEditor();
        editor.getOpenedDocument().getUndoRedoStack().redo(editor);
        editor.repaintView();
    }
}

