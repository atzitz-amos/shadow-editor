import {LanguageBase} from "../../../editor/lang/LanguageBase";
import {IncrementalLexer} from "../../../editor/lang/lexer/IncrementalLexer";
import {ASTBuilder} from "../../../editor/lang/ast/builder/ASTBuilder";
import {IParser} from "../../../editor/lang/ast/IParser";
import {JsParser} from "./parser/JsParser";
import {HighlighterBase} from "../../../editor/lang/highlighter/HighlighterBase";
import {JsHighlighter} from "./highlighter/JsHighlighter";
import JsIncrLexer from "./lexer/JsIncrLexer";


export default class JsLang extends LanguageBase {
    public getName(): string {
        return "JavaScript";
    }

    public createLexer(): IncrementalLexer {
        return new JsIncrLexer();
    }

    public createHighlighter(): HighlighterBase {
        return new JsHighlighter();
    }

    public createParser(builder: ASTBuilder): IParser {
        return new JsParser(builder);
    }
}