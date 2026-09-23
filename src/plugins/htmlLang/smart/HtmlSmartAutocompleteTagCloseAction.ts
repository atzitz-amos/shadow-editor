import {EditorCharTypedContext} from "../../../editor/core/behaviors/context/EditorCharTypedContext";
import {LanguageBase} from "../../../lang/LanguageBase";
import HTMLLang from "../lang/HTMLLang";
import {SmartInlineInsertAction} from "../../../lang/codeAnalysis/smart/insert/SmartInlineInsertAction";
import {BehaviorHandlingMode} from "../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import {HtmlTagNode} from "../lang/syntax/nodes/HtmlTagNode";
import {HtmlTagBody} from "../lang/syntax/nodes/HtmlTagBody";
import {UndoStack} from "../../../editor/core/undo/UndoStack";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export default class HtmlSmartAutocompleteTagCloseAction extends SmartInlineInsertAction {
    getApplicableLanguages(): LanguageBase[] {
        return [HTMLLang.INSTANCE];
    }

    isApplicable(ctx: EditorCharTypedContext): boolean {
        const node = ctx.getNodeAt();
        if (!(node instanceof HtmlTagBody)) return false;
        return ctx.getLeadingChar() === "<" && ctx.getContent() === "/";
    }

    invoke(ctx: EditorCharTypedContext): BehaviorHandlingMode {
        let node = ctx.getNodeAt();
        while (node && !(node instanceof HtmlTagNode && node.isUnclosed())) {
            let previous = node.previousSibling();
            if (!previous) node = node?.getParent();
            else node = previous;

            if (node instanceof HtmlTagNode) console.log(node.isUnclosed());
        }

        if (node instanceof HtmlTagNode && node.isUnclosed()) {
            const name = node.getTagName();
            UndoStack.undoableAction(ctx.getEditor(), "htmlAutocomplete", () => {
                ctx.getEditor().getOpenedDocument().insertText(ctx.getCaret().getOffset(), `/${name}>`);
            });
            ctx.getCaret().moveToOffset(ctx.getCaret().getOffset() + name.length + 2);

            ctx.getEditor().repaintView();
            return BehaviorHandlingMode.HANDLED;
        } else return BehaviorHandlingMode.FORWARD;
    }

}
