import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key} from "../../../core/keybinds/Keybind";
import {KeybindContextDescriptor} from "../../../core/keybinds/context/KeybindContextDescriptor";
import {ClipboardUtils} from "../../core/clipboard/ClipboardUtils";

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
        const caret = editor.getPrimaryCaret();

        if (!caret.getSelectionModel().isSelectionActive) {
            let line = editor.getOpenedDocument().getLineAt(caret.getOffset());
            caret.getSelectionModel().select(line.getStart(), line.getEnd());
            caret.refresh();
        }
        ClipboardUtils.copyToClipboard(caret.getSelectedText()!);
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
        const caret = editor.getPrimaryCaret();

        if (!caret.getSelectionModel().isSelectionActive) {
            let line = editor.getOpenedDocument().getLineAt(caret.getOffset());
            const text = editor.getOpenedDocument().substring(line.getStart(), line.getEnd());
            editor.deleteWholeLine(caret);
            ClipboardUtils.copyToClipboard(text);
            return;
        }
        ClipboardUtils.copyToClipboard(caret.getSelectedText()!);
        editor.deleteSelection(caret);
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

        ClipboardUtils.getClipboardText().then(text => {
            if (text) {
                editor.type(text);
            }
        });
    }
}