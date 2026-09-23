import {AbstractAction} from "../../../core/actions/AbstractAction";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {KeybindContextDescriptor} from "../../../core/keybinds/context/KeybindContextDescriptor";
import {IdeDialogUtilsCore} from "../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {DebugToolsPopup} from "../popup/DebugToolsPopup";
import {DataKey} from "../../../core/keybinds/context/data/DataKey";

/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export default class OpenDebugToolsAction extends AbstractAction {
    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.COMMA,
            shift: false,
            ctrl: true,
            alt: true
        };
    }

    getKeybindContext(): KeybindContextDescriptor {
        return KeybindContextDescriptor.IN_MAIN_WINDOW;
    }

    getDescription(): string {
        return "Open the debug tools popup";
    }

    getName(): string {
        return "Open debug tools";
    }

    getRequiredKeys(): DataKey<unknown>[] {
        return [];
    }

    run(ctx: KeybindContext): void | Promise<void> {
        if (IdeDialogUtilsCore.isOpen(DebugToolsPopup)) {
            IdeDialogUtilsCore.closeDialog(DebugToolsPopup);
        } else {
            IdeDialogUtilsCore.showDialog(new DebugToolsPopup());
        }
    }
}
