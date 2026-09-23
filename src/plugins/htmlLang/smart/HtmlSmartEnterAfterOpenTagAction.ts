import {EditorCharTypedContext} from "../../../editor/core/behaviors/context/EditorCharTypedContext";
import {BehaviorHandlingMode} from "../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import {LanguageBase} from "../../../lang/LanguageBase";
import HTMLLang from "../lang/HTMLLang";
import {HtmlTagNode} from "../lang/syntax/nodes/HtmlTagNode";
import {SmartInlineEnterAction} from "../../../lang/codeAnalysis/smart/enter/SmartInlineEnterAction";
import {UndoStack} from "../../../editor/core/undo/UndoStack";
import {IndentUtils} from "../../../lang/syntax/utils/IndentUtils";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export default class HtmlSmartEnterAfterOpenTagAction extends SmartInlineEnterAction {
    getApplicableLanguages(): LanguageBase[] {
        return [HTMLLang.INSTANCE];
    }

    isApplicable(ctx: EditorCharTypedContext): boolean {
        const node = ctx.getNodeAt()?.getEnclosingOfType(HtmlTagNode)
        return !!node && node.isUnclosed();
    }

    invoke(ctx: EditorCharTypedContext): BehaviorHandlingMode {
        const node = ctx.getNodeAt()?.getEnclosingOfType(HtmlTagNode)!;
        const name = node.getTagName();

        const indent = IndentUtils.makeIndentString(ctx.getLineData().getIndentationSize());
        if (!node.isUnclosed()) {
            UndoStack.undoableAction(ctx.getEditor(), "htmlAutocloseTag", () => {
                const doc = ctx.getEditor().getOpenedDocument();

                let text = "\n";
                text += IndentUtils.indent(indent, 1, 2);
                doc.insertText(ctx.getCaret().getOffset(), text);
                ctx.getCaret().moveToOffset(ctx.getCaret().getOffset() + text.length);
            });
            return BehaviorHandlingMode.HANDLED;
        }

        UndoStack.undoableAction(ctx.getEditor(), "htmlAutocloseTag", () => {
            const doc = ctx.getEditor().getOpenedDocument();

            let text = "\n";
            text += IndentUtils.indent(indent, 1, 2);

            doc.insertText(ctx.getCaret().getOffset(), text);
            ctx.getCaret().moveToOffset(ctx.getCaret().getOffset() + text.length);
            doc.insertText(ctx.getCaret().getOffset(), `\n${indent}</${name}>`);
        });

        ctx.getEditor().repaintView();

        return BehaviorHandlingMode.HANDLED;
    }

}
