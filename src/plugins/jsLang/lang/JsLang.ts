import {LanguageBase} from "../../../core/lang/LanguageBase";
import {IncrementalLexer} from "../../../core/lang/syntax/builder/lexer/IncrementalLexer";
import {JsParser} from "./parser/JsParser";
import {HighlighterBase} from "../../../core/lang/highlighter/HighlighterBase";
import {JsHighlighter} from "./highlighter/JsHighlighter";
import JsIncrLexer from "./lexer/JsIncrLexer";
import {ASTBuilder} from "../../../core/lang/syntax/builder/parser/builder/ASTBuilder";
import {IParser} from "../../../core/lang/syntax/builder/parser/IParser";


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