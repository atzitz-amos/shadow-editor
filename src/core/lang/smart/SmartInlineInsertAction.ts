import {LanguageBase} from "../LanguageBase";
import {EditorCharTypedContext} from "../../../editor/core/behaviors/context/EditorCharTypedContext";
import {BehaviorHandlingMode} from "../../../editor/core/behaviors/manager/BehaviorHandlingMode";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export abstract class SmartInlineInsertAction {
    abstract getApplicableLanguages(): LanguageBase[];

    abstract isApplicable(ctx: EditorCharTypedContext): boolean;

    abstract invoke(ctx: EditorCharTypedContext): BehaviorHandlingMode;
}