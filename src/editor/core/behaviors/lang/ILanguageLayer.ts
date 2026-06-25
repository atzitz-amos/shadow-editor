import {IBehaviorProvider} from "../IBehaviorProvider";
import {LanguageBase} from "../../../../core/lang/LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 6/22/2026
 * @since 1.0.0
 */
export interface ILanguageLayer extends IBehaviorProvider {
    getLanguage(): LanguageBase;

    setLanguage(language: LanguageBase): void;
}
