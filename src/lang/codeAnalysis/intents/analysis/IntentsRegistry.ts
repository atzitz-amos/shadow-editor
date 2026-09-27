import {ExtensionPoint} from "../../../../core/plugins/extensionPoints/ExtensionPoint";
import {IntentBase} from "../IntentBase";
import {LanguageBase} from "../../../LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 9/23/2026
 * @since 1.0.0
 */
export class IntentsRegistry {
    private static instance: IntentsRegistry = new IntentsRegistry();

    private static readonly intentsEP = new ExtensionPoint("intents", IntentBase);

    public static getAllIntents(): IntentBase[] {
        return IntentsRegistry.intentsEP.getAll();
    }

    static getForLanguage(language: LanguageBase) {
        return IntentsRegistry.getAllIntents().filter(intent => intent.getApplicableLanguage().includes(language));
    }

    static getInstance() {
        return this.instance;
    }
}
