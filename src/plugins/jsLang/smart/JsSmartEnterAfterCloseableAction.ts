import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SmartInlineEnterAction} from "../../../core/lang/smart/enter/SmartInlineEnterAction";
import {EditorBehaviorContext} from "../../../editor/core/behaviors/context/EditorBehaviorContext";
import {BehaviorHandlingMode} from "../../../editor/core/behaviors/manager/BehaviorHandlingMode";
import JsLang from "../lang/JsLang";
import {JsSmartActionsUtils} from "./JsSmartActionsUtils";
import {ModifierKeyHolder} from "../../../core/keybinds/Keybind";
import {IndentUtils} from "../../../core/lang/syntax/utils/IndentUtils";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";

/**
 *
 * @author Atzitz Amos
 * @date 7/6/2026
 * @since 1.0.0
 */
export default class JsSmartEnterAfterCloseableAction extends SmartInlineEnterAction {
    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class];
    }

    isApplicable(ctx: EditorBehaviorContext): boolean {
        return !ModifierKeyHolder.isShiftPressed()
            && JsSmartActionsUtils.hasClosing(ctx.getLeadingChar())
            && !JsSmartActionsUtils.isQuote(ctx.getLeadingChar());
    }

    invoke(ctx: EditorBehaviorContext): BehaviorHandlingMode {
        const caret = ctx.getCaret();
        const editor = ctx.getEditor();
        const document = editor.getOpenedDocument();

        const line = document.getLineAt(caret.getOffset());

        let indent = 0;
        if (line) {
            indent = IndentUtils.getIndentationSize(line.getText());
            indent += 4;
        }

        editor.typeForCaret(caret, "\n" + " ".repeat(indent), !ModifierKeyHolder.isCtrlPressed());

        if (JsSmartActionsUtils.closing(ctx.getLeadingChar() ?? '') === ctx.getTrailingChar()) {
            editor.typeForCaret(caret, "\n" + " ".repeat(indent - 4), false);
        }

        return BehaviorHandlingMode.HANDLED;
    }
}

