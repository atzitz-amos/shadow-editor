import {CharTypedBehavior} from "./behavior/CharTypedBehavior";
import {DeleteBackwardBehavior} from "./behavior/DeleteBackwardBehavior";
import {DeleteForwardBehavior} from "./behavior/DeleteForwardBehavior";
import {EnterPressedBehavior} from "./behavior/EnterPressedBehavior";
import {TabPressedBehavior} from "./behavior/TabPressedBehavior";
import {ShiftTabPressedBehavior} from "./behavior/ShiftTabPressedBehavior";
import {CopyBehavior} from "./behavior/CopyBehavior";
import {CutBehavior} from "./behavior/CutBehavior";
import {PasteBehavior} from "./behavior/PasteBehavior";
import {CtrlDeleteBehavior} from "./behavior/CtrlDeleteBehavior";
import {BehaviorHandlingMode} from "./manager/BehaviorHandlingMode";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export interface IBehaviorProvider {
    getCharTypedBehavior(): CharTypedBehavior;

    getDeleteBackwardBehavior(): DeleteBackwardBehavior;

    getDeleteForwardBehavior(): DeleteForwardBehavior;

    getCtrlDeleteBehavior(): CtrlDeleteBehavior;

    getEnterPressedBehavior(): EnterPressedBehavior;

    getTabPressedBehavior(): TabPressedBehavior;

    getShiftTabPressedBehavior(): ShiftTabPressedBehavior;

    getCopyBehavior(): CopyBehavior;

    getCutBehavior(): CutBehavior;

    getPasteBehavior(): PasteBehavior;
}