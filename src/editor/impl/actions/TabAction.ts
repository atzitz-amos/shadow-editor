import {AbstractAction} from "../../../core/actions/AbstractAction";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {EditorBehaviorContext} from "../../core/behaviors/context/EditorBehaviorContext";


export class TabAction extends AbstractAction {
    getName(): string {
        return 'Tab';
    }

    getDescription(): string {
        return 'Insert a tab character at the caret position.';
    }

    getDefaultKeybinding() {
        return {
            key: Key.TAB,
            ctrl: false,
            alt: false,
            shift: false
        };
    }

    run(ctx: KeybindContext) {
        const editor = ctx.requireEditor();
        ctx.getEvent().preventDefault();

        editor.getCaretModel().forEachCaret(caret => {
            editor.getBehaviorManager().invokeTabPressed(new EditorBehaviorContext(editor, caret));
        });
    }
}

export class ShiftTabAction extends AbstractAction {
    run(ctx: KeybindContext): void | Promise<void> {
        ctx.getEvent().preventDefault();

        const editor = ctx.requireEditor();
        editor.getCaretModel().forEachCaret(caret => {
            editor.getBehaviorManager().invokeShiftTabPressed(new EditorBehaviorContext(editor, caret));
        });
    }

    getName(): string {
        return "Dedent"
    }

    getDescription(): string {
        return "Dedent code fragment"
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.TAB,
            shift: true,
            ctrl: false,
            alt: false
        }
    }

}