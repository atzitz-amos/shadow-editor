import {LanguageBase} from "../../../../lang/LanguageBase";
import {LanguageParserDefinition} from "../../../../lang/definitions/LanguageParserDefinition";
import {ASTBuilder} from "../../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {IParser} from "../../../../lang/syntax/builder/parser/IParser";
import {SynPrinter} from "../../../../lang/syntax/writer/SynPrinter";
import JsLang from "../JsLang";
import {JsParser} from "../parser/JsParser";
import {JsPrinter} from "../template/JsPrinter";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export default class JsParserDefinition extends LanguageParserDefinition {
    public getLanguage(): LanguageBase {
        return JsLang.INSTANCE;
    }

    public createParser(builder: ASTBuilder): IParser {
        return new JsParser(builder);
    }

    public createPrinter(): SynPrinter {
        return new JsPrinter();
    }
}
