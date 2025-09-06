import {AbstractAction} from "./AbstractAction";
import {Key} from "../events/keybind";
import {Editor} from "../../Editor";

export class SelectAllAction extends AbstractAction {
    name = 'SelectAll';
    description = 'Select all text in the editor.';

    keybinding = {
        key: Key.A,
        ctrl: true,
        alt: false,
        shift: false
    };

    run(editor: Editor, _: KeyboardEvent) {
        editor.getCaretModel().removeAll();
        editor.getCaretModel().getPrimary().getSelectionModel().select(0, editor.getOpenedDocument().getTotalDocumentLength());
        editor.view.resetBlink();
    }
}

export class SelectDoubleClickAction extends AbstractAction {
    static readonly DELIMITER = /[\s.,;:!?(){}[\]<>]/;

    name = 'SelectDoubleClick';
    description = 'Select word under the caret.';
    keybinding = {
        key: Key.LeftDoubleClick,
        shift: false
    }

    run(editor: Editor) {
        const caret = editor.getPrimaryCaret();
        const wordRange = editor.getOpenedDocument().getWordAt(caret.getOffset(), SelectDoubleClickAction.DELIMITER);
        caret.selectionModel.select(wordRange.begin, wordRange.end);
        editor.view.resetBlink();
    }
}