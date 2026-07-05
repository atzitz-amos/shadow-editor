import {AbstractAction} from "../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../core/keybinds/Keybind";
import {PopupUtilsCore} from "../../../core/ui/lib/popup/PopupUtilsCore";
import {FaIcon} from "../../../core/ui/icons/FaIcon";
import {SynSuiteEngine} from "../../../core/lang/suite/SynSuiteEngine";

/**
 *
 * @author Atzitz Amos
 * @date 7/3/2026
 * @since 1.0.0
 */
export default class SynSuiteSnapshotAction extends AbstractAction {
    async run(ctx: KeybindContext) {
        if (!ctx.isEditorEvent()) ctx.abort();
        const editor = ctx.requireEditor();

        if (!editor.getCurrentLanguage()) ctx.abort();

        const key = await PopupUtilsCore.askString("Enter test key:", "key", FaIcon.solid("hashtag"));
        if (!key) return;
        const description = await PopupUtilsCore.askString("Enter test description:", "description", FaIcon.solid("pencil"));
        if (!description) return;

        await SynSuiteEngine.getInstance().snapshot(key, "default.jsLang", description);
    }

    getName(): string {
        return "syn-suite-snapshot"
    }

    getDescription(): string {
        return "Take a snapshot of the current file for the SynSuiteEngine"
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.NUMPAD_ENTER,
            ctrl: true,
            shift: false,
            alt: false
        };
    }

}
