import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SmartInlineDeleteAction} from "../../../core/lang/smart/delete/SmartInlineDeleteAction";
import {EditorDeleteContext} from "../../../editor/core/behaviors/context/EditorDeleteContext";
import {BehaviorHandlingMode} from "../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import JsLang from "../lang/JsLang";
import {IndentUtils} from "../../../core/lang/syntax/utils/IndentUtils";

/**
 *
 * @author Atzitz Amos
 * @date 7/6/2026
 * @since 1.0.0
 */
export default class JsSmartBackspaceDedentAction extends SmartInlineDeleteAction {
    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class];
    }

    isApplicable(ctx: EditorDeleteContext): boolean {
        const document = ctx.getEditor().getOpenedDocument();
        const line = document.getLineAt(ctx.getCaretOffset());

        return !ctx.hasSelectionActive()
            && ctx.getDeleteCount() === -1
            && IndentUtils.isAtLineBegin(line.getText(), ctx.getCaretOffset() - line.getStart());
    }

    invoke(ctx: EditorDeleteContext): BehaviorHandlingMode {
        const editor = ctx.getEditor();
        const document = editor.getOpenedDocument();
        const caret = ctx.getCaret();
        const line = document.getLineAt(caret.getOffset());

        return BehaviorHandlingMode.FORWARD;
    }

    getPriority(): number {
        return 20;
    }
}
