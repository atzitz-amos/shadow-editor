import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SmartSkipSecondCloseableCharAction} from "../../../core/lang/smart/insert/SmartSkipSecondCloseableCharAction";
import JsLang from "../lang/JsLang";
import {JsSmartActionsUtils} from "./JsSmartActionsUtils";

/**
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export default class JsSmartSkipSecondCloseableCharAction extends SmartSkipSecondCloseableCharAction {
    constructor() {
        super(Object.values(JsSmartActionsUtils.AUTOCLOSEABLES));
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class]
    }

    shouldSkip(char: string, leadingChar: string): boolean {
        return true; // TODO: implement logic to determine if the second closeable char should be skipped
    }

}
