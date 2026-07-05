import {AbstractAction} from "../../../core/actions/AbstractAction";
import {Key} from "../../../core/keybinds/Keybind";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";

export class SelectAllAction extends AbstractAction {
    getName(): string {
        return 'SelectAll';
    }

    getDescription(): string {
        return 'Select all text in the editor.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.A,
            ctrl: true,
            alt: false,
            shift: false
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getCaretModel().removeAll();
        editor.getCaretModel().getPrimary().getSelectionModel().select(0, editor.getOpenedDocument().getTotalDocumentLength());
        editor.getView().resetBlink();
    }
}

export class SelectDoubleClickAction extends AbstractAction {
    static readonly DELIMITER = /[\s.,;:!?(){}[\]<>]/;

    getName(): string {
        return 'SelectDoubleClick';
    }

    getDescription(): string {
        return 'Select word under the caret.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.LeftDoubleClick,
            shift: false
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        const caret = editor.getPrimaryCaret();
        const wordRange = editor.getOpenedDocument().getWordAt(caret.getOffset(), SelectDoubleClickAction.DELIMITER);
        caret.getSelectionModel().select(wordRange.start, wordRange.end);
        editor.getView().resetBlink();
    }
}


export class SelectTripleClickAction extends AbstractAction {
    getName(): string {
        return 'SelectTripleClick';
    }

    getDescription(): string {
        return 'Select the whole line.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.LeftTripleClick,
            shift: false
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        const caret = editor.getPrimaryCaret();
        const line = editor.getOpenedDocument().getLineAt(caret.getOffset());
        const range = line.getAssociatedRange();
        caret.getSelectionModel().select(range.start, range.end);
        editor.getView().resetBlink();
    }
}