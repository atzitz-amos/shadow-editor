import {ExtensionPoint} from "../../../../core/plugins/extensionPoints/ExtensionPoint";
import {CompletionTriggerHandler} from "./CompletionTriggerHandler";
import {LanguageBase} from "../../../LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export class CompletionTriggerManager {
    private static readonly triggerHandlerEP = new ExtensionPoint<CompletionTriggerHandler>("completion", CompletionTriggerHandler);

    public static getTriggerHandler(language: LanguageBase) {
        return this.triggerHandlerEP.getAll().find(handler => handler.getApplicableLanguages().includes(language)) || null;
    }
}
