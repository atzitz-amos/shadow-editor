import {AbstractAction} from "../../../../../../core/actions/AbstractAction";
import {KeybindContext} from "../../../../../../core/keybinds/context/KeybindContext";
import {Keybind} from "../../../../../../core/keybinds/Keybind";
import {CommonDataKeys} from "../../../../../../core/keybinds/context/data/CommonDataKeys";
import {DataKey} from "../../../../../../core/keybinds/context/data/DataKey";
import {ProjectFilesContextMenuActionGroup} from "./ProjectFilesContextMenuActionGroup";
import {IdeDialogUtilsCore} from "../../../../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {NewEntryChooseTypeDialog} from "../dialog/NewEntryChooseTypeDialog";
import {ProjectDirectory} from "../../../../../../core/project/filesystem/tree/ProjectDirectory";
import {ProjectFile} from "../../../../../../core/project/filesystem/tree/ProjectFile";
import {EditorTabsHelper} from "../../../../../core/tabs/EditorTabsHelper";

/**
 *
 * @author Atzitz Amos
 * @date 9/21/2026
 * @since 1.0.0
 */
export class ProjectFilesNewEntryAction extends AbstractAction {
    async run(ctx: KeybindContext): Promise<void> {
        const filesTree = ctx.require(CommonDataKeys.FILES_TREE)
        let entry = ctx.require(CommonDataKeys.PROJECT_ENTRY) as ProjectDirectory | ProjectFile;
        if (!(entry instanceof ProjectDirectory)) entry = entry.getParent()!;

        const result = await IdeDialogUtilsCore.awaitDialog(new NewEntryChooseTypeDialog());
        if (!result) return;

        const name = await IdeDialogUtilsCore.askString("Enter name", "Name");
        if (!name) return;

        const child = result.createEntry(entry, name);

        if (!filesTree.isExpanded(entry)) {
            filesTree.setExpanded(entry);
        }

        setTimeout(async () => {
            filesTree.select(child)
            if (child instanceof ProjectFile) await EditorTabsHelper.newTab(child);
        });
    }

    addToGroups() {
        ProjectFilesContextMenuActionGroup.INSTANCE
            .addAction(this, {index: 0});
    }

    getName(): string {
        return "New..."
    }

    getDescription(): string {
        return "Create a new file or folder in the project";
    }

    getDefaultKeybinding(): Keybind | null {
        return null;
    }

    getRequiredKeys(): DataKey<unknown>[] {
        return [CommonDataKeys.FILES_TREE, CommonDataKeys.PROJECT_ENTRY];
    }
}
