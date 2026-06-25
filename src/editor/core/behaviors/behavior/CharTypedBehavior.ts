import {EditorBehavior} from "../EditorBehavior";
import {BehaviorHandlingMode} from "../manager/BehaviorHandlingMode";
import {EditorCharTypedContext} from "../context/EditorCharTypedContext";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export abstract class CharTypedBehavior extends EditorBehavior {
    private static readonly cache: Map<any, CharTypedBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorCharTypedContext) => BehaviorHandlingMode) {
        if (!CharTypedBehavior.cache.has(owner)) {
            CharTypedBehavior.cache.set(owner, new class extends CharTypedBehavior {
                invoke(context: EditorCharTypedContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return CharTypedBehavior.cache.get(owner) as CharTypedBehavior;
    }

    abstract invoke(context: EditorCharTypedContext): BehaviorHandlingMode;
}
