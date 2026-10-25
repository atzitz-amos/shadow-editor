import {DefaultCharTypedBehavior} from "./DefaultCharTypedBehavior";
import {DefaultDeleteForwardBehavior} from "./DefaultDeleteForwardBehavior";
import {DefaultDeleteBackwardBehavior} from "./DefaultDeleteBackwardBehavior";
import {DefaultCtrlDeleteBehavior} from "./DefaultCtrlDeleteBehavior";
import {DefaultEnterPressedBehavior} from "./DefaultEnterPressedBehavior";
import {DefaultCopyBehavior} from "./DefaultCopyBehavior";
import {DefaultPasteBehavior} from "./DefaultPasteBehavior";
import {DefaultCutBehavior} from "./DefaultCutBehavior";
import {DefaultTabPressedBehavior} from "./DefaultTabPressedBehavior";
import {DefaultShiftTabPressedBehavior} from "./DefaultShiftTabPressedBehavior";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export class DefaultBehaviors {
    public static readonly CHAR_TYPED_BEHAVIOR = new DefaultCharTypedBehavior();
    public static readonly DELETE_FORWARD_BEHAVIOR = new DefaultDeleteForwardBehavior();
    public static readonly DELETE_BACKWARD_BEHAVIOR = new DefaultDeleteBackwardBehavior();
    public static readonly CTRL_DELETE_BEHAVIOR = new DefaultCtrlDeleteBehavior();
    public static readonly ENTER_PRESSED_BEHAVIOR = new DefaultEnterPressedBehavior();
    public static readonly TAB_PRESSED_BEHAVIOR = new DefaultTabPressedBehavior();
    public static readonly SHIFT_TAB_PRESSED_BEHAVIOR = new DefaultShiftTabPressedBehavior();
    public static readonly COPY_BEHAVIOR = new DefaultCopyBehavior();
    public static readonly PASTE_BEHAVIOR = new DefaultPasteBehavior();
    public static readonly CUT_BEHAVIOR = new DefaultCutBehavior();
}
