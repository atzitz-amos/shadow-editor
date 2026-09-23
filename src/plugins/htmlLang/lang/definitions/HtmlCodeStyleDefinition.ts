import {CodeStyleManager} from "../../../../lang/codeStyle/manager/CodeStyleManager";
import {LanguageCodeStyleDefinition} from "../../../../lang/definitions/LanguageCodeStyleDefinition";
import {LanguageBase} from "../../../../lang/LanguageBase";
import HTMLLang from "../HTMLLang";
import {HtmlCodeStyleManager} from "../codeStyle/HtmlCodeStyleManager";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export default class HtmlCodeStyleDefinition extends LanguageCodeStyleDefinition {
    public getLanguage(): LanguageBase {
        return HTMLLang.INSTANCE;
    }

    public getCodeStyleManager(): CodeStyleManager {
        return HtmlCodeStyleManager.getInstance();
    }
}
