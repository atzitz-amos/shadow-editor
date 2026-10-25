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
export abstract class TabPressedBehavior extends EditorBehavior {
    private static readonly cache: Map<any, TabPressedBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorDeleteContext) => BehaviorHandlingMode) {
        if (!TabPressedBehavior.cache.has(owner)) {
            TabPressedBehavior.cache.set(owner, new class extends TabPressedBehavior {
                invoke(context: EditorDeleteContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return TabPressedBehavior.cache.get(owner) as TabPressedBehavior;
    }

    abstract invoke(context: EditorBehaviorContext): BehaviorHandlingMode;
}
