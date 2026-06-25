import {IBehaviorContext} from "./context/IBehaviorContext";
import {BehaviorHandlingMode} from "./manager/BehaviorHandlingMode";

/**
 *
 * @author Atzitz Amos
 * @date 6/10/2026
 * @since 1.0.0
 */
export abstract class EditorBehavior {
    public static readonly FORWARD_ALL = new class extends EditorBehavior {
        invoke(context: IBehaviorContext): BehaviorHandlingMode {
            return BehaviorHandlingMode.FORWARD;
        }
    }

    public static readonly DO_NOTHING = new class extends EditorBehavior {
        invoke(context: IBehaviorContext): BehaviorHandlingMode {
            return BehaviorHandlingMode.HANDLED;
        }
    }

    abstract invoke(context: IBehaviorContext): BehaviorHandlingMode;
}
