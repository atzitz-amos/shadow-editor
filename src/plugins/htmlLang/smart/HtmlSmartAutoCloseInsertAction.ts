import {EditorCharTypedContext} from "../../../editor/core/behaviors/context/EditorCharTypedContext";
import {SmartAutoCloseInsertAction} from "../../../lang/codeAnalysis/smart/insert/SmartAutoCloseAction";
import {LanguageBase} from "../../../lang/LanguageBase";
import HTMLLang from "../lang/HTMLLang";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export default class HtmlSmartAutoCloseInsertAction extends SmartAutoCloseInsertAction {
    constructor() {
        super({
            '"': '"',
            "'": "'"
        });
    }

    getApplicableLanguages(): LanguageBase[] {
        return [HTMLLang.INSTANCE];
    }

    shouldAutoClose(ctx: EditorCharTypedContext, leadingChar: string, char: string, trailingChar: string): boolean {
        return ctx.getLeadingNonWhitespaceChar() === '=';
    }
}
