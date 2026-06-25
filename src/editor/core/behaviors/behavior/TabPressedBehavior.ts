import {EditorBehavior} from "../EditorBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {EditorBehaviorContext} from "../context/EditorBehaviorContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export abstract class TabPressedBehavior extends EditorBehavior {
    abstract invoke(context: EditorBehaviorContext): BehaviorHandlingMode;
}
