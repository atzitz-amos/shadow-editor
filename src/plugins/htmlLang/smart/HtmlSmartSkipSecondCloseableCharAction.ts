import {
    SmartSkipSecondCloseableCharAction
} from "../../../lang/codeAnalysis/smart/insert/SmartSkipSecondCloseableCharAction";
import {LanguageBase} from "../../../lang/LanguageBase";
import HTMLLang from "../lang/HTMLLang";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export default class HtmlSmartSkipSecondCloseableCharAction extends SmartSkipSecondCloseableCharAction {
    constructor() {
        super(["'", '"']);
    }

    getApplicableLanguages(): LanguageBase[] {
        return [HTMLLang.INSTANCE];
    }

    shouldSkip(char: string, leadingChar: string): boolean {
        return true;
    }
}
