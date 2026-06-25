import {EditorBehavior} from "../EditorBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {EditorDeleteContext} from "../context/EditorDeleteContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export abstract class CtrlDeleteBehavior extends EditorBehavior {
    abstract invoke(context: EditorDeleteContext): BehaviorHandlingMode;
}
