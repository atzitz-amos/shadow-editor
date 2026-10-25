import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {IdeDialogUtilsCore} from "../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {SynSuitePopup} from "../synSuite/SynSuitePopup";

/**
 *
 * @author Atzitz Amos
 * @date 10/24/2026
 * @since 1.0.0
 */
export default class OpenSynSuiteWindowAction extends AbstractAction {
    run(ctx: KeybindContext): void {
        IdeDialogUtilsCore.showDialog(new SynSuitePopup());
    }

    getName(): string {
        return "Open SynSuite Window";
    }

    getDescription(): string {
        return "Open the SynSuite window";
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.T,
            ctrl: true,
            shift: true,
            alt: true
        };
    }

}
