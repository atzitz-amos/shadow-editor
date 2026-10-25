import {AbstractAction} from "../../../core/actions/AbstractAction";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {IdeDialogUtilsCore} from "../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {SynSuiteSnapshotDialog} from "../synSuite/SynSuiteSnapshotDialog";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export default class SnapshotSynSuiteTestAction extends AbstractAction {
    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.T,
            ctrl: true,
            shift: false,
            alt: true
        };
    }

    getDescription(): string {
        return "Create a SynSuite test case from the opened file";
    }

    getName(): string {
        return "Snapshot SynSuite test";
    }

    run(ctx: KeybindContext): void {
        ctx.getEvent().preventDefault();
        IdeDialogUtilsCore.showDialog(new SynSuiteSnapshotDialog(ctx.requireEditor()));
    }
}