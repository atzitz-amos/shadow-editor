import {LanguageBase} from "../../LanguageBase";
import {EditorDeleteContext} from "../../../../editor/core/behaviors/context/EditorDeleteContext";
import {BehaviorHandlingMode} from "../../../../editor/core/behaviors/manager/BehaviorHandlingMode";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export abstract class SmartInlineDeleteAction {
    abstract getApplicableLanguages(): LanguageBase[];

    abstract isApplicable(ctx: EditorDeleteContext): boolean;

    abstract invoke(ctx: EditorDeleteContext): BehaviorHandlingMode;
}
