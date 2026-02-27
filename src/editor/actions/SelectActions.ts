import {AbstractAction} from "../../core/actions/AbstractAction";
import {Key} from "../../core/keybinds/Keybind";
import {KeybindContext} from "../../core/keybinds/context/KeybindContext";

export class SelectAllAction extends AbstractAction {
    name = 'SelectAll';
    description = 'Select all text in the editor.';

    defaultKeybinding = {
        key: Key.A,
        ctrl: true,
        alt: false,
        shift: false
    };

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        editor.getCaretModel().removeAll();
        editor.getCaretModel().getPrimary().getSelectionModel().select(0, editor.getOpenedDocument().getTotalDocumentLength());
        editor.view.resetBlink();
    }
}

export class SelectDoubleClickAction extends AbstractAction {
    static readonly DELIMITER = /[\s.,;:!?(){}[\]<>]/;

    name = 'SelectDoubleClick';
    description = 'Select word under the caret.';
    defaultKeybinding = {
        key: Key.LeftDoubleClick,
        shift: false
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        const caret = editor.getPrimaryCaret();
        const wordRange = editor.getOpenedDocument().getWordAt(caret.getOffset(), SelectDoubleClickAction.DELIMITER);
        caret.getSelectionModel().select(wordRange.start, wordRange.end);
        editor.view.resetBlink();
    }
}


export class SelectTripleClickAction extends AbstractAction {
    name = 'SelectTripleClick';
    description = 'Select the whole line.';
    defaultKeybinding = {
        key: Key.LeftTripleClick,
        shift: false
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        const caret = editor.getPrimaryCaret();
        const line = editor.getOpenedDocument().getLineAt(caret.getOffset());
        const range = line.getAssociatedRange();
        caret.getSelectionModel().select(range.start, range.end);
        editor.view.resetBlink();
    }
}