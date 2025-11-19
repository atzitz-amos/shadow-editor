import {LanguageBase} from "../../../core/lang/LanguageBase";
import {IncrementalLexer} from "../../../core/lang/lexer/IncrementalLexer";
import {ASTBuilder} from "../../../core/lang/ast/builder/ASTBuilder";
import {IParser} from "../../../core/lang/ast/IParser";
import {JsParser} from "./parser/JsParser";
import {HighlighterBase} from "../../../core/lang/highlighter/HighlighterBase";
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