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
export abstract class ShiftTabPressedBehavior extends EditorBehavior {
    private static readonly cache: Map<any, ShiftTabPressedBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorDeleteContext) => BehaviorHandlingMode) {
        if (!ShiftTabPressedBehavior.cache.has(owner)) {
            ShiftTabPressedBehavior.cache.set(owner, new class extends ShiftTabPressedBehavior {
                invoke(context: EditorDeleteContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return ShiftTabPressedBehavior.cache.get(owner) as ShiftTabPressedBehavior;
    }

    abstract invoke(context: EditorBehaviorContext): BehaviorHandlingMode;
}
