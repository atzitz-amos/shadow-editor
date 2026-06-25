import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SmartAutoCloseInsertAction} from "../../../core/lang/smart/SmartAutoCloseAction";
import JsLang from "../lang/JsLang";

/**
 *
 * @author Atzitz Amos
 * @date 6/25/2026
 * @since 1.0.0
 */
export default class JsSmartAutoCloseInsertAction extends SmartAutoCloseInsertAction {
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
        return [JsLang.class];
    }

    shouldAutoClose(char: string, closeChar: string, trailingChar: string): boolean {
        return trailingChar !== closeChar && /^[\s,.;:!?)]*$/.test(trailingChar);
    }
}
