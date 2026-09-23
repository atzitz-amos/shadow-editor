import {ActionGroup} from "../../../../core/actions/group/ActionGroup";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export class EditorTabContextMenuActionGroup extends ActionGroup {
    public static INSTANCE: EditorTabContextMenuActionGroup = new EditorTabContextMenuActionGroup();

    private constructor() {
        super();
    }

    getId(): string {
        return "editor-tab-context-menu";
    }
}
