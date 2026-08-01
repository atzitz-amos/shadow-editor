import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SmartAutoCloseInsertAction} from "../../../core/lang/smart/insert/SmartAutoCloseAction";
import JsLang from "../lang/JsLang";
import {JsSmartActionsUtils} from "./JsSmartActionsUtils";
import {EditorCharTypedContext} from "../../../editor/core/behaviors/context/EditorCharTypedContext";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import {JsSynUtils} from "../lang/syntax/utils/JsSynUtils";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export default class JsSmartAutoCloseInsertAction extends SmartAutoCloseInsertAction {
    constructor() {
        super(JsSmartActionsUtils.AUTOCLOSEABLES);
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class];
    }

    shouldAutoClose(ctx: EditorCharTypedContext, leadingChar: string, char: string, trailingChar: string): boolean {
        const document = ctx.getEditor().getOpenedDocument();
        let token = ctx.getTokenAtCaret();
        if (!token && ctx.getCaretOffset() > 0) {
            token = document.getTokenAt(ctx.getCaretOffset() - 1)!; // Greedy left
        }
        if (token?.isCommentToken()) return false;
        if ((char === "'" || char === '"')) {
            if (token?.getType() === JsLexicalGrammar.STRING_LITERAL) {
                return !JsSynUtils.isStringLiteralUnterminated(token);
            }
        } else if (token?.getType() === JsLexicalGrammar.STRING_LITERAL) return false;

        return trailingChar !== JsSmartActionsUtils.closing(char) && JsSmartActionsUtils.isValidTrailingChar(trailingChar);
    }
}