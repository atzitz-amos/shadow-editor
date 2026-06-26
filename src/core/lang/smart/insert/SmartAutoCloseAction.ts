import {EditorCharTypedContext} from "../../../../editor/core/behaviors/context/EditorCharTypedContext";
import {BehaviorHandlingMode} from "../../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import {LanguageBase} from "../../LanguageBase";
import {SmartInlineInsertAction} from "./SmartInlineInsertAction";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export abstract class SmartAutoCloseInsertAction extends SmartInlineInsertAction {

    protected constructor(protected readonly closeables: Record<string, string>) {
        super();
    }


    abstract getApplicableLanguages(): LanguageBase[];

    abstract shouldAutoClose(char: string, closeChar: string, trailingChar: string): boolean;

    isApplicable(ctx: EditorCharTypedContext): boolean {
        return this.closeables[ctx.getContent()] !== undefined;
    }

    invoke(ctx: EditorCharTypedContext): BehaviorHandlingMode {
        const editor = ctx.getEditor();
        if (ctx.hasSelectionActive()) {
            editor.insertText(ctx.getSelection().getActualStart(), ctx.getContent());
            editor.insertText(ctx.getSelection().getActualEnd(), this.closeables[ctx.getContent()]);

            ctx.getCaret().shiftRight(true, false);
            ctx.getCaret().refresh();
            return BehaviorHandlingMode.HANDLED;
        }
        if (this.shouldAutoClose(ctx.getContent(), this.closeables[ctx.getContent()], ctx.getTrailingChar() ?? '')) {
            const caret = ctx.getCaret();
            const offset = caret.getOffset();
            const closeChar = this.closeables[ctx.getContent()];
            editor.insertText(offset, ctx.getContent() + closeChar);
            editor.getOpenedDocument().getUndoRedoStack().onTyped(caret, offset, ctx.getContent() + closeChar);
            if (ctx.shouldMoveCaret()) {
                caret.moveToOffset(offset + 1);
                caret.refresh();
            }

            return BehaviorHandlingMode.HANDLED;
        }
        return BehaviorHandlingMode.FORWARD;
    }

}
