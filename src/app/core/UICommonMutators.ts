import {UIMutator} from "../../core/ui/engine/listeners/mutators/UIMutator";
import {WorkspaceService} from "../../core/workspace/WorkspaceService";

/**
 *
 * @author Atzitz Amos
 * @date 4/28/2026
 * @since 1.0.0
 */
export class UICommonMutators {
    public static readonly WORKSPACE_LIST = new UIMutator<WorkspaceService>(UICommonMutators, "workspaceList");
}
