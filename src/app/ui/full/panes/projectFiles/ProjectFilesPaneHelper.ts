import {ProjectFilesPane} from "./ProjectFilesPane";
import {GlobalState} from "../../../../../core/global/GlobalState";
import {ProjectFilesPaneComponent} from "./ProjectFilesPaneComponent";
import {UIHooks} from "../../../../../core/ui/engine/listeners/hooks/UIHooks";
import {ProjectHooks} from "../../../../core/UICommonHooks";
import {ProjectFile} from "../../../../../core/project/filesystem/tree/ProjectFile";
import {PopupUtilsCore} from "../../../../../core/ui/lib/popup/utils/PopupUtilsCore";
import {ProjectDirectory} from "../../../../../core/project/filesystem/tree/ProjectDirectory";
import {FileSystemEntry} from "../../../../../core/project/filesystem/tree/FileSystemEntry";

/**
 *
 * @author Atzitz Amos
 * @date 6/27/2026
 * @since 1.0.0
 */
export class ProjectFilesPaneHelper {
    private static selectedTreeEntry: FileSystemEntry | null = null;

    public static setSelected(treeEntry: FileSystemEntry | null): void {
        this.selectedTreeEntry = treeEntry;
        UIHooks.trigger(ProjectHooks.PROJECT_FILES_SELECTED_CHANGED, treeEntry);
    }

    public static getSelectedTreeEntry(): FileSystemEntry | null {
        if (!this.isPresent()) return null;
        return this.selectedTreeEntry;
    }

    public static hasFocus() {
        if (!this.isPresent()) return false;
        return this.getProjectFilesComponent()!.hasFocus();
    }

    static async renameFile(file: ProjectFile) {
        const newName = await PopupUtilsCore.askString(
            `Rename file '${file.getName()}' to:`,
            file.getName()
        )

        if (newName) {
            file.rename(newName);
        }
    }

    static async renameDir(directory: ProjectDirectory) {
        const newName = await PopupUtilsCore.askString(
            `Rename directory '${directory.getName()}' to:`,
            directory.getName()
        )

        if (newName) {
            await directory.rename(newName);
        }
    }

    private static isPresent(): boolean {
        return !!GlobalState.getPaneManager().getByClass(ProjectFilesPane)[0];
    }

    private static getProjectFilesInstance(): ProjectFilesPane | null {
        let pane = GlobalState.getPaneManager().getByClass(ProjectFilesPane)[0];
        if (!pane) {
            return null;
        }
        return pane;
    }

    private static getProjectFilesComponent(): ProjectFilesPaneComponent | null {
        return this.getProjectFilesInstance()?.getComponent() as ProjectFilesPaneComponent | null;
    }
}
