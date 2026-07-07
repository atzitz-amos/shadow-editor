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
    private static readonly cache: Map<any, CtrlDeleteBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorDeleteContext) => BehaviorHandlingMode) {
        if (!CtrlDeleteBehavior.cache.has(owner)) {
            CtrlDeleteBehavior.cache.set(owner, new class extends CtrlDeleteBehavior {
                invoke(context: EditorDeleteContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return CtrlDeleteBehavior.cache.get(owner) as CtrlDeleteBehavior;
    }

    abstract invoke(context: EditorDeleteContext): BehaviorHandlingMode;
}
