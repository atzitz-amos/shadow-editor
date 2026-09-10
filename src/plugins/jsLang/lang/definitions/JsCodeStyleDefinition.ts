import {CodeStyleManager} from "../../../../lang/codeStyle/manager/CodeStyleManager";
import {LanguageCodeStyleDefinition} from "../../../../lang/definitions/LanguageCodeStyleDefinition";
import {LanguageBase} from "../../../../lang/LanguageBase";
import JsLang from "../JsLang";
import {JsCodeStyleManager} from "../../codeStyle/JsCodeStyleManager";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export default class JsCodeStyleDefinition extends LanguageCodeStyleDefinition {
    public getLanguage(): LanguageBase {
        return JsLang.INSTANCE;
    }

    public getCodeStyleManager(): CodeStyleManager {
        return JsCodeStyleManager.getInstance();
    }

}
