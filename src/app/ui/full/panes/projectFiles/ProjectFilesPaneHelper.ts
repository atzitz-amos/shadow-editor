import {ProjectFilesPane} from "./ProjectFilesPane";
import {GlobalState} from "../../../../../core/global/GlobalState";
import {ProjectFilesPaneComponent} from "./ProjectFilesPaneComponent";
import {ProjectFilesTreeNode} from "./tree/ProjectFilesTreeNode";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {UIHooks} from "../../../../../core/ui/engine/listeners/hooks/UIHooks";
import {WorkspaceHooks} from "../../../../core/UICommonHooks";

/**
 *
 * @author Atzitz Amos
 * @date 6/27/2026
 * @since 1.0.0
 */
export class ProjectFilesPaneHelper {
    private static selectedTreeEntry: (ProjectFilesTreeNode & UIComponent) | null = null;

    public static setSelected(treeEntry: (ProjectFilesTreeNode & UIComponent) | null): void {
        this.selectedTreeEntry = treeEntry;
        UIHooks.trigger(WorkspaceHooks.PROJECT_FILES_SELECTED_CHANGED, treeEntry);
    }

    public static getSelectedTreeEntry(): (ProjectFilesTreeNode & UIComponent) | null {
        if (!this.isPresent()) return null;
        return this.selectedTreeEntry;
    }

    public static hasFocus() {
        if (!this.isPresent()) return false;
        return this.getProjectFilesComponent()!.hasFocus();
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
