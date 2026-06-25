import {IBehaviorProvider} from "../../core/behaviors/IBehaviorProvider";
import {EditorBehavior} from "../../core/behaviors/EditorBehavior";
import {DefaultBehaviors} from "./default/DefaultBehaviors";
import {CtrlDeleteBehavior} from "../../core/behaviors/behavior/CtrlDeleteBehavior";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export class StandardBehaviorsLayer implements IBehaviorProvider {
    getCharTypedBehavior(): EditorBehavior {
        return DefaultBehaviors.CHAR_TYPED_BEHAVIOR;
    }

    getCopyBehavior(): EditorBehavior {
        return EditorBehavior.DO_NOTHING;
    }

    getCutBehavior(): EditorBehavior {
        return EditorBehavior.DO_NOTHING;
    }

    getShiftTabPressedBehavior(): EditorBehavior {
        return EditorBehavior.DO_NOTHING;
    }

    getDeleteBackwardBehavior(): EditorBehavior {
        return DefaultBehaviors.DELETE_BACKWARD_BEHAVIOR;
    }

    getDeleteForwardBehavior(): EditorBehavior {
        return DefaultBehaviors.DELETE_FORWARD_BEHAVIOR;
    }

    getCtrlDeleteBehavior(): CtrlDeleteBehavior {
        return DefaultBehaviors.CTRL_DELETE_BEHAVIOR;
    }

    getEnterPressedBehavior(): EditorBehavior {
        return EditorBehavior.DO_NOTHING;
    }

    getPasteBehavior(): EditorBehavior {
        return EditorBehavior.DO_NOTHING;
    }

    getTabPressedBehavior(): EditorBehavior {
        return EditorBehavior.DO_NOTHING;
    }
}
