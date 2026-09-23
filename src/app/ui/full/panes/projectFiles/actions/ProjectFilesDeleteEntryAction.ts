import {AbstractAction} from "../../../../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../../../../core/keybinds/context/KeybindContext";
import {Key, Keybind} from "../../../../../../core/keybinds/Keybind";
import {ProjectFilesContextMenuActionGroup} from "./ProjectFilesContextMenuActionGroup";
import {ProjectFilesNewEntryAction} from "./ProjectFilesNewEntryAction";
import {DataKey} from "../../../../../../core/keybinds/context/data/DataKey";
import {IdeDialogUtilsCore} from "../../../../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {CommonDataKeys} from "../../../../../../core/keybinds/context/data/CommonDataKeys";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class ProjectFilesDeleteEntryAction extends AbstractAction {
    async run(ctx: KeybindContext): Promise<void> {
        const entry = ctx.require(CommonDataKeys.PROJECT_ENTRY);
        if (!await IdeDialogUtilsCore.confirm("Delete", "Are you sure you want to delete: " + entry.getName() + "?")) return;

        entry.delete();
    }

    addToGroups() {
        ProjectFilesContextMenuActionGroup.INSTANCE
            .addAction(this, {after: ProjectFilesNewEntryAction.getID()});
    }

    getName(): string {
        return "Delete";
    }

    getDescription(): string {
        return "Delete the selected file or folder from the project";
    }

    getDefaultKeybinding(): Keybind | null {
        return {key: Key.DELETE};
    }

    getRequiredKeys(): DataKey<unknown>[] {
        return [CommonDataKeys.PROJECT_ENTRY];
    }
}
