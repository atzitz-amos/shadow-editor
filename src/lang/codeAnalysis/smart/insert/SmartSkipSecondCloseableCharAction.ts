import {EditorCharTypedContext} from "../../../../editor/core/behaviors/context/EditorCharTypedContext";
import {BehaviorHandlingMode} from "../../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import {LanguageBase} from "../../../LanguageBase";
import {SmartInlineInsertAction} from "./SmartInlineInsertAction";
import {ModifierKeyHolder} from "../../../../core/keybinds/Keybind";

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

    abstract shouldSkip(char: string, leadingChar: string): boolean;

    invoke(ctx: EditorCharTypedContext): BehaviorHandlingMode {
        ModifierKeyHolder.getInstance().clear();

        if (this.shouldSkip(ctx.getContent(), ctx.getLeadingChar() ?? '')) {
            const caret = ctx.getCaret();
            caret.shiftRight(true);
            caret.refresh();
            return BehaviorHandlingMode.HANDLED;
        }
        return BehaviorHandlingMode.FORWARD;
    }

    getPriority(): number {
        return 10;
    }
}
