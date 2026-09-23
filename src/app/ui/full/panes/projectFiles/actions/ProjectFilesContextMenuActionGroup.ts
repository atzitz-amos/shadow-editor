import {ActionGroup} from "../../../../../../core/actions/group/ActionGroup";

/**
 *
 * @author Atzitz Amos
 * @date 9/21/2026
 * @since 1.0.0
 */
export class ProjectFilesContextMenuActionGroup extends ActionGroup {
    public static INSTANCE: ProjectFilesContextMenuActionGroup = new ProjectFilesContextMenuActionGroup();

    private constructor() {
        super();
    }

    getId(): string {
        return "projectFiles.fileContextMenu";
    }
}
