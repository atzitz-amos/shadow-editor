import {LanguageParserDefinition} from "../../../../lang/definitions/LanguageParserDefinition";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {ASTBuilder} from "../../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {IParser} from "../../../../lang/syntax/builder/parser/IParser";
import {SynPrinter} from "../../../../lang/syntax/writer/SynPrinter";
import RiscvLang from "../RiscvLang";
import {RiscVParser} from "../parser/RiscVParser";

/**
 *
 * @author Atzitz Amos
 * @date 10/6/2026
 * @since 1.0.0
 */
export default class RiscVParserDefinition extends LanguageParserDefinition {
    public getLanguage(): LanguageBase {
        return RiscvLang.INSTANCE;
    }

    public createParser(builder: ASTBuilder): IParser {
        return new RiscVParser(builder);
    }

    public createPrinter(): SynPrinter {
        throw new Error("Method not implemented.");
    }

}
