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

    run(editor: Editor, _: any) {
        editor.caretModel.removeAll();
        editor.caretModel.primary.selectionModel.set(0, editor.data.raw.length());
        editor.view.resetBlink();
    }
}