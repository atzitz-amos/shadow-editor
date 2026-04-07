import {AbstractAction} from "../../core/actions/AbstractAction";
import {Key} from "../../core/keybinds/Keybind";
import {KeybindContext} from "../../core/keybinds/context/KeybindContext";


export class TabAction extends AbstractAction {
    name = 'TabAction';
    description = 'Insert a tab character at the caret position.';

    defaultKeybinding = {
        key: Key.TAB,
        ctrl: false,
        alt: false,
        shift: false
    };

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();

        ctx.getEvent().preventDefault();
        editor.caretModel.forEachCaret(caret => {
            editor.insertText(caret.getOffset(), '    ');
        });
        editor.caretModel.shift(4);
        editor.view.resetBlink();
    }
}