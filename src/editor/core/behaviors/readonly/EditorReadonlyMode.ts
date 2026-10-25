import {EditorModeEx} from "../mode/EditorModeEx";
import {EditorBehavior} from "../EditorBehavior";
import {EnterPressedBehavior} from "../behavior/EnterPressedBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {DeleteBackwardBehavior} from "../behavior/DeleteBackwardBehavior";
import {DeleteForwardBehavior} from "../behavior/DeleteForwardBehavior";
import {CharTypedBehavior} from "../behavior/CharTypedBehavior";
import {CtrlDeleteBehavior} from "../behavior/CtrlDeleteBehavior";
import {PasteBehavior} from "../behavior/PasteBehavior";
import {TabPressedBehavior} from "../behavior/TabPressedBehavior";
import {ShiftTabPressedBehavior} from "../behavior/ShiftTabPressedBehavior";
import {CutBehavior} from "../behavior/CutBehavior";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class EditorReadonlyMode extends EditorModeEx {
    getDisplayName(): string {
        return "Readonly";
    }

    escapeWillExit(): boolean {
        return false;
    }

    getEnterPressedBehavior(): EditorBehavior {
        return EnterPressedBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }

    getDeleteBackwardBehavior(): EditorBehavior {
        return DeleteBackwardBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }

    getDeleteForwardBehavior(): EditorBehavior {
        return DeleteForwardBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }

    getCharTypedBehavior(): EditorBehavior {
        return CharTypedBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }

    getCtrlDeleteBehavior(): CtrlDeleteBehavior {
        return CtrlDeleteBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }

    getPasteBehavior(): EditorBehavior {
        return PasteBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }

    getCutBehavior(): EditorBehavior {
        return CutBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }

    getTabPressedBehavior(): EditorBehavior {
        return TabPressedBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }

    getShiftTabPressedBehavior(): EditorBehavior {
        return ShiftTabPressedBehavior.wrapping(this, ctx => {
            return BehaviorHandlingMode.HANDLED;
        });
    }
}
