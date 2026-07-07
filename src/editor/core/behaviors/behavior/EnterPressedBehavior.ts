import {EditorBehavior} from "../EditorBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {EditorBehaviorContext} from "../context/EditorBehaviorContext";
import {EditorDeleteContext} from "../context/EditorDeleteContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export abstract class EnterPressedBehavior extends EditorBehavior {
    private static readonly cache: Map<any, EnterPressedBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorDeleteContext) => BehaviorHandlingMode) {
        if (!EnterPressedBehavior.cache.has(owner)) {
            EnterPressedBehavior.cache.set(owner, new class extends EnterPressedBehavior {
                invoke(context: EditorDeleteContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return EnterPressedBehavior.cache.get(owner)!;
    }

    abstract invoke(context: EditorBehaviorContext): BehaviorHandlingMode;
}
