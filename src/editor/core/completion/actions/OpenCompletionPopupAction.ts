import {AbstractAction} from "../../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../../core/keybinds/Keybind";
import {CompletionManager} from "../../../../lang/codeCompletion/manager/CompletionManager";

/**
 *
 * @author Atzitz Amos
 * @date 10/26/2026
 * @since 1.0.0
 */
export default class OpenCompletionPopupAction extends AbstractAction {
    run(ctx: KeybindContext): void | Promise<void> {
        ctx.getEvent().preventDefault();
        const editor = ctx.requireEditor();
        const document = editor.getOpenedDocument();

        const manager = CompletionManager.getInstance();
        manager.openAutoComplete(editor, document, editor.getPrimaryCaret().getOffset());
    }

    getName(): string {
        return "Auto-complete"
    }

    getDescription(): string {
        return "Show auto-completions popups at caret"
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.SPACE,
            ctrl: true,
            shift: false,
            alt: false
        }
    }

}
