import {BehaviorManager} from "../../core/behaviors/manager/BehaviorManager";
import {StandardLanguageLayer} from "./lang/StandardLanguageLayer";
import {StandardBehaviorsLayer} from "./StandardBehaviorsLayer";
import {Editor} from "../../Editor";

/**
 *
 * @author Atzitz Amos
 * @date 6/23/2026
 * @since 1.0.0
 */
export class StandardBehaviorManagerProvider {
    public static createDefault(): BehaviorManager {
        return new BehaviorManager(new StandardLanguageLayer(), new StandardBehaviorsLayer());
    }
}
