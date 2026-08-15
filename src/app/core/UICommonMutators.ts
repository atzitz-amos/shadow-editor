import {UIMutator} from "../../core/ui/engine/listeners/mutators/UIMutator";
import {ProjectService} from "../../core/project/ProjectService";

/**
 *
 * @author Atzitz Amos
 * @date 4/28/2026
 * @since 1.0.0
 */
export class UICommonMutators {
    public static readonly PROJECT_LIST = new UIMutator<ProjectService>(UICommonMutators, "projectList");
}
