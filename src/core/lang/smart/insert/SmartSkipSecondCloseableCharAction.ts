import {EditorCharTypedContext} from "../../../../editor/core/behaviors/context/EditorCharTypedContext";
import {BehaviorHandlingMode} from "../../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import {LanguageBase} from "../../LanguageBase";
import {SmartInlineInsertAction} from "./SmartInlineInsertAction";

/**
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export abstract class SmartSkipSecondCloseableCharAction extends SmartInlineInsertAction {
    constructor(protected readonly closeableChars: string[]) {
        super();
    }

    abstract getApplicableLanguages(): LanguageBase[];

    isApplicable(ctx: EditorCharTypedContext): boolean {
        return this.closeableChars.includes(ctx.getContent()) && !ctx.hasSelectionActive() && ctx.getTrailingChar() === ctx.getContent();
    }

    abstract shouldSkip(char: string, trailingChar: string): boolean;

    invoke(ctx: EditorCharTypedContext): BehaviorHandlingMode {
        if (this.shouldSkip(ctx.getContent(), ctx.getTrailingChar() ?? '')) {
            const caret = ctx.getCaret();
            caret.shiftRight(true, false);
            caret.refresh();
            return BehaviorHandlingMode.HANDLED;
        }
        return BehaviorHandlingMode.FORWARD;
    }

}
