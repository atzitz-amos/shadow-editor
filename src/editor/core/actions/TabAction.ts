import {AbstractAction} from "./AbstractAction";
import {Key} from "../events/keybind";
import {Editor} from "../../Editor";


export class TabAction extends AbstractAction {
    name = 'TabAction';
    description = 'Insert a tab character at the caret position.';

    keybinding = {
        key: Key.TAB,
        ctrl: false,
        alt: false,
        shift: false
    };

    run(editor: Editor, event: KeyboardEvent) {
        event.preventDefault();
        editor.caretModel.forEachCaret(caret => {
            editor.insertText(caret.getOffset(), '    ');
            editor.caretModel.shift(4);
        });
        editor.view.resetBlink();
    }
}