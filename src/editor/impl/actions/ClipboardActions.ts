import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key} from "../../../core/keybinds/Keybind";
import {KeybindContextDescriptor} from "../../../core/keybinds/context/KeybindContextDescriptor";
import {ClipboardBehaviorContext} from "../../core/behaviors/context/ClipboardBehaviorContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class CopyAction extends AbstractAction {
    getName(): string {
        return "Copy";
    }

    getDescription(): string {
        return "Copy the selected text to the clipboard.";
    }

    getDefaultKeybinding() {
        return {
            key: Key.C,
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

        editor.getCaretModel().forEachCaret(caret => {
            editor.getBehaviorManager().invokeCopy(new ClipboardBehaviorContext(editor, caret));
        });
        editor.getView().resetBlink();
    }

}


export class CutAction extends AbstractAction {
    getName(): string {
        return "Cut";
    }

    getDescription(): string {
        return "Cut the selected text to the clipboard.";
    }

    getDefaultKeybinding() {
        return {
            key: Key.X,
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
        ctx.getEvent().preventDefault();

        editor.getCaretModel().forEachCaret(caret => {
            editor.getBehaviorManager().invokeCut(new ClipboardBehaviorContext(editor, caret));
        });
        editor.getView().resetBlink();
    }
}

export class PasteAction extends AbstractAction {
    getName(): string {
        return "Paste";
    }

    getDescription(): string {
        return "Paste the text from the clipboard.";
    }

    getDefaultKeybinding() {
        return {
            key: Key.V,
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
        ctx.getEvent().preventDefault();

        editor.getCaretModel().forEachCaret(caret => {
            editor.getBehaviorManager().invokePaste(new ClipboardBehaviorContext(editor, caret));
        });
        editor.getView().resetBlink();
    }
}