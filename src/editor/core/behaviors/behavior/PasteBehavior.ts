import {EditorBehavior} from "../EditorBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {ClipboardBehaviorContext} from "../context/ClipboardBehaviorContext";
import {EditorDeleteContext} from "../context/EditorDeleteContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export abstract class PasteBehavior extends EditorBehavior {
    private static readonly cache: Map<any, PasteBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorDeleteContext) => BehaviorHandlingMode) {
        if (!PasteBehavior.cache.has(owner)) {
            PasteBehavior.cache.set(owner, new class extends PasteBehavior {
                invoke(context: EditorDeleteContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return PasteBehavior.cache.get(owner) as PasteBehavior;
    }

    abstract invoke(context: ClipboardBehaviorContext): BehaviorHandlingMode;
}
