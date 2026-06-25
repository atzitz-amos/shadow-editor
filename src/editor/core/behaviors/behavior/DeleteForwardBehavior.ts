import {EditorBehavior} from "../EditorBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {EditorDeleteContext} from "../context/EditorDeleteContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export abstract class DeleteForwardBehavior extends EditorBehavior {
    private static readonly cache: Map<any, DeleteForwardBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorDeleteContext) => BehaviorHandlingMode) {
        if (!DeleteForwardBehavior.cache.has(owner)) {
            DeleteForwardBehavior.cache.set(owner, new class extends DeleteForwardBehavior {
                invoke(context: EditorDeleteContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return DeleteForwardBehavior.cache.get(owner) as DeleteForwardBehavior;
    }

    abstract invoke(context: EditorDeleteContext): BehaviorHandlingMode;
}
