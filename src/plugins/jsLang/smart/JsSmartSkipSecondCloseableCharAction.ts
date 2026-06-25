import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SmartSkipSecondCloseableCharAction} from "../../../core/lang/smart/SmartSkipSecondCloseableCharAction";
import JsLang from "../lang/JsLang";

/**
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export default class JsSmartSkipSecondCloseableCharAction extends SmartSkipSecondCloseableCharAction {
    constructor() {
        super([")", "}", "]", '"', "'"]);
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class]
    }

    shouldSkip(char: string, trailingChar: string): boolean {
        return true; // TODO: implement logic to determine if the second closeable char should be skipped
    }

}
