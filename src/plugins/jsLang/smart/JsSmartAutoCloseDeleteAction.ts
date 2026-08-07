import {LanguageBase} from "../../../lang/LanguageBase";
import {SmartAutoCloseDeleteAction} from "../../../lang/codeAnalysis/smart/delete/SmartAutoCloseDeleteAction";
import JsLang from "../lang/JsLang";

/**
 *
 * @author Atzitz Amos
 * @date 7/5/2026
 * @since 1.0.0
 */
export default class JsSmartAutoCloseDeleteAction extends SmartAutoCloseDeleteAction {

    constructor() {
        super({
            '"': '"',
            "'": "'",
            "[": "]",
            "(": ")",
            "{": "}"
        });
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    shouldDelete(char: string, trailingChar: string): boolean {
        return true;
    }

}
