import {EditorBehaviorContext} from "../../../../editor/core/behaviors/context/EditorBehaviorContext";
import {HighlightHolder} from "../../../../editor/ui/highlighter/HighlightHolder";
import {LanguageBase} from "../../LanguageBase";

/**
 * A SmartInline action that runs everytime the caret moves. It can apply selective highlighting based on where the caret is.
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export abstract class SmartInlineHighlight {
    abstract isApplicable(ctx: EditorBehaviorContext): boolean;

    abstract apply(ctx: EditorBehaviorContext, holder: HighlightHolder): void;

    abstract getApplicableLanguages(): LanguageBase[];
}