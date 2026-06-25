import {EditorBehavior} from "../EditorBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {EditorDeleteContext} from "../context/EditorDeleteContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export abstract class DeleteBackwardBehavior extends EditorBehavior {
    private static readonly cache: Map<any, DeleteBackwardBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorDeleteContext) => BehaviorHandlingMode) {
        if (!DeleteBackwardBehavior.cache.has(owner)) {
            DeleteBackwardBehavior.cache.set(owner, new class extends DeleteBackwardBehavior {
                invoke(context: EditorDeleteContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return DeleteBackwardBehavior.cache.get(owner) as DeleteBackwardBehavior;
    }

    abstract invoke(context: EditorDeleteContext): BehaviorHandlingMode;
}
