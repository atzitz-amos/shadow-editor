import {LanguageBase} from "../../LanguageBase";
import {EditorBehaviorContext} from "../../../../editor/core/behaviors/context/EditorBehaviorContext";
import {BehaviorHandlingMode} from "../../../../editor/core/behaviors/manager/BehaviorHandlingMode";

/**
 *
 * @author Atzitz Amos
 * @date 7/6/2026
 * @since 1.0.0
 */
export abstract class SmartInlineEnterAction {
    abstract getApplicableLanguages(): LanguageBase[];

    abstract isApplicable(ctx: EditorBehaviorContext): boolean;

    abstract invoke(ctx: EditorBehaviorContext): BehaviorHandlingMode;

    getPriority() {
        return 0;
    }
}
