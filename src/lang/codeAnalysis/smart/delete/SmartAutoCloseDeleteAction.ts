import {EditorDeleteContext} from "../../../../editor/core/behaviors/context/EditorDeleteContext";
import {BehaviorHandlingMode} from "../../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import {LanguageBase} from "../../../LanguageBase";
import {SmartInlineDeleteAction} from "./SmartInlineDeleteAction";

/**
 *
 * @author Atzitz Amos
 * @date 7/5/2026
 * @since 1.0.0
 */
export abstract class SmartAutoCloseDeleteAction extends SmartInlineDeleteAction {
    constructor(protected readonly closeables: Record<string, string>) {
        super();
    }

    abstract getApplicableLanguages(): LanguageBase[];

    abstract shouldDelete(char: string, trailingChar: string): boolean;

    isApplicable(ctx: EditorDeleteContext): boolean {
        return ctx.getDeleteCount() < 0
            && !ctx.hasSelectionActive()
            && this.closeables[ctx.getDeleteText()] !== undefined
            && ctx.getTrailingChar() === this.closeables[ctx.getDeleteText()];
    }

    invoke(ctx: EditorDeleteContext): BehaviorHandlingMode {
        if (this.shouldDelete(ctx.getDeleteText(), ctx.getTrailingChar() ?? '')) {
            const editor = ctx.getEditor();
            const offset = ctx.getDeleteOffset();
            const count = ctx.getDeleteCount();

            console.log(offset + count, offset + 1);

            editor.deleteAt(offset + count, -count + 1);

            ctx.getCaret().shiftLeft();
            ctx.getCaret().refresh();
            return BehaviorHandlingMode.HANDLED;
        }
        return BehaviorHandlingMode.FORWARD;
    }
}
