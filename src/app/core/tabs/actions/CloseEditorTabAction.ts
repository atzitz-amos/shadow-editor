import {AbstractAction} from "../../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../../core/keybinds/Keybind";
import {DataKey} from "../../../../core/keybinds/context/data/DataKey";
import {CommonDataKeys} from "../../../../core/keybinds/context/data/CommonDataKeys";
import {TabsManager} from "../TabsManager";
import {EditorTabContextMenuActionGroup} from "./EditorTabContextMenuActionGroup";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class CloseEditorTabAction extends AbstractAction {
    run(ctx: KeybindContext): void | Promise<void> {
        const tab = ctx.require(CommonDataKeys.SELECTED_EDITOR_TAB);
        TabsManager.getInstance().close(tab);
    }

    getName(): string {
        return "Close Tab";
    }

    getDescription(): string {
        return "Close the current editor tab";
    }

    getDefaultKeybinding(): Keybind | null {
        return {key: Key.F4, ctrl: true};
    }

    getRequiredKeys(): DataKey<unknown>[] {
        return [CommonDataKeys.SELECTED_EDITOR_TAB];
    }

    addToGroups() {
        EditorTabContextMenuActionGroup.INSTANCE
            .addAction(this, {index: 0});
    }
}
