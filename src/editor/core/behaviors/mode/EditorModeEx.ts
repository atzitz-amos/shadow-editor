import {IEditorMode} from "./IEditorMode";
import {EditorBehavior} from "../EditorBehavior";
import {IBehaviorProvider} from "../IBehaviorProvider";
import {CtrlDeleteBehavior} from "../behavior/CtrlDeleteBehavior";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export abstract class EditorModeEx implements IEditorMode {
    getCustomRenderer(): any | null {
        return null;
    }

    getCharTypedBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getDeleteBackwardBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getDeleteForwardBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCtrlDeleteBehavior(): CtrlDeleteBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getTabPressedBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getShiftTabPressedBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getEnterPressedBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCopyBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getCutBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }

    getPasteBehavior(): EditorBehavior {
        return EditorBehavior.FORWARD_ALL;
    }
}
