import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SmartInlineEnterAction} from "../../../core/lang/smart/enter/SmartInlineEnterAction";
import {EditorBehaviorContext} from "../../../editor/core/behaviors/context/EditorBehaviorContext";
import {BehaviorHandlingMode} from "../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import JsLang from "../lang/JsLang";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import {IndentUtils} from "../../../core/lang/syntax/utils/IndentUtils";
import {ModifierKeyHolder} from "../../../core/keybinds/Keybind";
import {JsSynUtils} from "../lang/syntax/utils/JsSynUtils";

/**
 *
 * @author Atzitz Amos
 * @date 7/7/2026
 * @since 1.0.0
 */
export default class JsSmartEnterInLiteralOrCommentAction extends SmartInlineEnterAction {
    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class];
    }

    isApplicable(ctx: EditorBehaviorContext): boolean {
        const token = ctx.getTokenAtCaret();
        return !ModifierKeyHolder.isShiftPressed() && token !== null && (
            token.getType() === JsLexicalGrammar.STRING_LITERAL || token.getType() === JsLexicalGrammar.SINGLE_LINE_COMMENT
        );
    }

    getPriority(): number {
        return 30;
    }

    invoke(ctx: EditorBehaviorContext): BehaviorHandlingMode {
        const token = ctx.getTokenAtCaret()!;
        const indent = IndentUtils.makeIndentString(token.getRange().start - ctx.getLineData().getStart());

        let content: string;

        if (token.isCommentToken()) {
            content = "\n" + indent + "// ";
        } else {
            const quote = JsSynUtils.getStringLiteralQuote(token);
            content = quote + " +\n" + indent + quote;
        }

        ctx.getEditor().typeForCaret(ctx.getCaret(), content, !ModifierKeyHolder.isCtrlPressed());

        return BehaviorHandlingMode.HANDLED;
    }
}
