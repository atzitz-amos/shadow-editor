import {LanguageBase} from "../../../lang/LanguageBase";
import {IncrementalLexer} from "../../../lang/syntax/builder/lexer/IncrementalLexer";
import {HighlighterBase} from "../../../lang/highlighter/HighlighterBase";
import {JsHighlighter} from "./highlighter/JsHighlighter";
import JsIncrLexer from "./lexer/JsIncrLexer";
import {Icon} from "../../../core/ui/icons/Icon";
import {FaIcon} from "../../../core/ui/icons/FaIcon";


export default class JsLang extends LanguageBase {
    public static _instance: JsLang;

    private constructor() {
        super();
        JsLang._instance = this;
    }

    public static get INSTANCE(): JsLang {
        return JsLang._instance!;
    }

    public getKey(): string {
        return "javascript";
    }

    public getDisplayName(): string {
        return "JavaScript";
    }

    public getIcon(): Icon | null {
        return FaIcon.brands("fa-js")
            .colored("#f7df1e");
    }

    public getDefaultExtension(): string {
        return "js";
    }


    public createLexer(): IncrementalLexer {
        return new JsIncrLexer();
    }

    public createHighlighter(): HighlighterBase {
        return new JsHighlighter();
    }
}