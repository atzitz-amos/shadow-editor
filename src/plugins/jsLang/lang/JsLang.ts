import {LanguageBase} from "../../../lang/LanguageBase";
import {IncrementalLexer} from "../../../lang/syntax/builder/lexer/IncrementalLexer";
import {JsParser} from "./parser/JsParser";
import {HighlighterBase} from "../../../lang/highlighter/HighlighterBase";
import {JsHighlighter} from "./highlighter/JsHighlighter";
import JsIncrLexer from "./lexer/JsIncrLexer";
import {ASTBuilder} from "../../../lang/syntax/builder/parser/builder/ASTBuilder";
import {IParser} from "../../../lang/syntax/builder/parser/IParser";
import {JsPrinter} from "./template/JsPrinter";
import {SpacingFormatter} from "../../../lang/codeStyle/spacing/SpacingFormatter";
import {JsSpacingRules} from "../codeStyle/JsSpacingRules";
import {JsLexicalGrammar} from "./lexer/JsLexicalGrammar";


export default class JsLang extends LanguageBase {
    public static _instance: JsLang;

    private constructor() {
        super();

        JsLang._instance = this;
    }

    public static get INSTANCE(): JsLang {
        if (!JsLang._instance) throw new Error("No instance of JsLang was found");
        return JsLang._instance;
    }

    getSpacingFormatter(): SpacingFormatter {
        return SpacingFormatter.make(JsSpacingRules, [JsLexicalGrammar.WHITESPACE], [JsLexicalGrammar.EOL]);
    }

    public getKey(): string {
        return "javascript";
    }

    public getDisplayName(): string {
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

    public getPrinter(): JsPrinter {
        return new JsPrinter();
    }
}