import {LanguageBase} from "../LanguageBase";
import {CodeStyleManager} from "../codeStyle/manager/CodeStyleManager";
import {ExtensionPoint} from "../../core/plugins/extensionPoints/ExtensionPoint";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export abstract class LanguageCodeStyleDefinition {
    private static readonly codeStyleDefinitionEP = new ExtensionPoint("lang/definitions", LanguageCodeStyleDefinition)
        .onContribute((_, def) => this.codeStyleManagersByLanguage.set(def.getLanguage().getKey(), def.getCodeStyleManager()));

    private static readonly codeStyleManagersByLanguage: Map<string, CodeStyleManager> = new Map<string, CodeStyleManager>();

    public static getCodeStyleManager(language: LanguageBase | null) {
        return language ? this.codeStyleManagersByLanguage.get(language.getKey()) ?? null : null;
    }

    static getInstanceOfManager(manager: Class<CodeStyleManager>) {
        return this.codeStyleDefinitionEP.getAll().find(def => def.getCodeStyleManager() instanceof manager)?.getCodeStyleManager() ?? null;
    }

    public abstract getLanguage(): LanguageBase;

    public abstract getCodeStyleManager(): CodeStyleManager;
}
