import {EditorBehavior} from "../EditorBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {ClipboardBehaviorContext} from "../context/ClipboardBehaviorContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export abstract class CopyBehavior extends EditorBehavior {
    abstract invoke(context: ClipboardBehaviorContext): BehaviorHandlingMode;
}
