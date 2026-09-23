import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {GlobalState} from "../../../core/global/GlobalState";
import {FullShadowUI} from "../../../app/ui/full/FullShadowUI";
import {IdeDialogUtilsCore} from "../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {SettingsDialog} from "../../../app/ui/full/settings/dialog/SettingsDialog";

/**
 *
 * @author Atzitz Amos
 * @date 9/13/2026
 * @since 1.0.0
 */
export class OpenSettingsAction extends AbstractAction {
    run(ctx: KeybindContext): void | Promise<void> {
        if (GlobalState.getUI() instanceof FullShadowUI) {
            IdeDialogUtilsCore.showDialog(new SettingsDialog());
        }
    }

    getName(): string {
        return "Open Settings";
    }

    getDescription(): string {
        return "Opens the settings dialog.";
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.S,
            ctrl: true,
            alt: true,
            shift: false
        }
    }

}
