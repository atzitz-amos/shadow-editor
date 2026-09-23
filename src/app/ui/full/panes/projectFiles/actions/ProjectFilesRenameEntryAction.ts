import {AbstractAction} from "../../../../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../../../../core/keybinds/Keybind";
import {DataKey} from "../../../../../../core/keybinds/context/data/DataKey";
import {CommonDataKeys} from "../../../../../../core/keybinds/context/data/CommonDataKeys";
import {IdeDialogUtilsCore} from "../../../../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {ProjectFilesContextMenuActionGroup} from "./ProjectFilesContextMenuActionGroup";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class ProjectFilesRenameEntryAction extends AbstractAction {
    async run(ctx: KeybindContext): Promise<void> {
        const entry = ctx.require(CommonDataKeys.PROJECT_ENTRY);

        const newName = await IdeDialogUtilsCore.askString("Enter new name", entry.getName())
        if (newName)
            entry.rename(newName);
    }

    getName(): string {
        return "Rename";
    }

    getDescription(): string {
        return "Rename the selected file or folder in the project";
    }

    getDefaultKeybinding(): Keybind | null {
        return {
            key: Key.F6,
            shift: true
        };
    }

    getRequiredKeys(): DataKey<unknown>[] {
        return [CommonDataKeys.FILES_TREE, CommonDataKeys.PROJECT_ENTRY]
    }

    addToGroups() {
        ProjectFilesContextMenuActionGroup.INSTANCE
            .addAction(this, {index: 1});
    }
}
