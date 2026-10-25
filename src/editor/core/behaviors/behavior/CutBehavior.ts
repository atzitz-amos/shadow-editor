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
export abstract class CutBehavior extends EditorBehavior {
    private static readonly cache: Map<any, CutBehavior> = new Map();

    public static wrapping(owner: any, cb: (context: EditorDeleteContext) => BehaviorHandlingMode) {
        if (!CutBehavior.cache.has(owner)) {
            CutBehavior.cache.set(owner, new class extends CutBehavior {
                invoke(context: EditorDeleteContext): BehaviorHandlingMode {
                    return cb(context);
                }
            });
        }
        return CutBehavior.cache.get(owner) as CutBehavior;
    }

    abstract invoke(context: ClipboardBehaviorContext): BehaviorHandlingMode;

}
