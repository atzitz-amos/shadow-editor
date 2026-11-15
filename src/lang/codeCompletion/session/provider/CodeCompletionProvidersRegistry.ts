import {ExtensionPoint} from "../../../../core/plugins/extensionPoints/ExtensionPoint";
import {CodeCompletionProvider} from "./CodeCompletionProvider";
import {LanguageBase} from "../../../LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 10/26/2026
 * @since 1.0.0
 */
export class CodeCompletionProvidersRegistry {
    private static readonly completionProviderEP = new ExtensionPoint("completion/provider", CodeCompletionProvider);

    public static getCompletionProviders(language: LanguageBase): CodeCompletionProvider[] {
        return this.completionProviderEP.getAll().filter(provider => provider.getApplicableLanguages().includes(language));
    }
}
