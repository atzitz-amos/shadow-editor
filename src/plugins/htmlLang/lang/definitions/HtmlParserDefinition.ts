import {LanguageParserDefinition} from "../../../../lang/definitions/LanguageParserDefinition";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {ASTBuilder} from "../../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {IParser} from "../../../../lang/syntax/builder/parser/IParser";
import {SynPrinter} from "../../../../lang/syntax/writer/SynPrinter";
import HTMLLang from "../HTMLLang";
import {HtmlParser} from "../parser/HtmlParser";

/**
 *
 * @author Atzitz Amos
 * @date 9/22/2026
 * @since 1.0.0
 */
export default class HtmlParserDefinition extends LanguageParserDefinition {
    public getLanguage(): LanguageBase {
        return HTMLLang.INSTANCE;
    }

    public createParser(builder: ASTBuilder): IParser {
        return new HtmlParser(builder);
    }

    public createPrinter(): SynPrinter {
        throw new Error("Method not implemented.");
    }

}
