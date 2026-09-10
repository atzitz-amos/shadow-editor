import {ExtensionPoint} from "../../core/plugins/extensionPoints/ExtensionPoint";
import {LanguageBase} from "../LanguageBase";
import {ASTBuilder} from "../syntax/builder/parser/builder/ASTBuilder";
import {IParser} from "../syntax/builder/parser/IParser";
import {SynPrinter} from "../syntax/writer/SynPrinter";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export abstract class LanguageParserDefinition {
    private static readonly parserDefinitionEP = new ExtensionPoint("lang/definitions", LanguageParserDefinition);

    public static getParserDefinition(language: LanguageBase) {
        let def: LanguageParserDefinition | null = null;
        for (const parserDef of this.parserDefinitionEP.getAll()) {
            if (parserDef.getLanguage() === language && (!def || def.getPriority() < parserDef.getPriority())) {
                def = parserDef;
            }
        }

        return def;
    }

    public getPriority(): number {
        return 1;
    }

    public abstract getLanguage(): LanguageBase;

    public abstract createParser(builder: ASTBuilder): IParser;

    public abstract createPrinter(): SynPrinter;
}
