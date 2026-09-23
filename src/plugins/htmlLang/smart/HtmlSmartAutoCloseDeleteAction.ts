import {SmartAutoCloseDeleteAction} from "../../../lang/codeAnalysis/smart/delete/SmartAutoCloseDeleteAction";
import {LanguageBase} from "../../../lang/LanguageBase";
import HTMLLang from "../lang/HTMLLang";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export default class HtmlSmartAutoCloseDeleteAction extends SmartAutoCloseDeleteAction {

    constructor() {
        super({
            '"': '"',
            "'": "'"
        });
    }

    getApplicableLanguages(): LanguageBase[] {
        return [HTMLLang.INSTANCE];
    }

    shouldDelete(char: string, trailingChar: string): boolean {
        return char === trailingChar;
    }

}
