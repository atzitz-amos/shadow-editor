import {DefaultCharTypedBehavior} from "./DefaultCharTypedBehavior";
import {DefaultDeleteForwardBehavior} from "./DefaultDeleteForwardBehavior";
import {DefaultDeleteBackwardBehavior} from "./DefaultDeleteBackwardBehavior";
import {DefaultCtrlDeleteBehavior} from "./DefaultCtrlDeleteBehavior";

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
}
