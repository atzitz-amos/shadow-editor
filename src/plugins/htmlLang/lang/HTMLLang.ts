import {HighlighterBase} from "../../../lang/highlighter/HighlighterBase";
import {LanguageBase} from "../../../lang/LanguageBase";
import {HtmlStatefulLexer} from "./lexer/HtmlStatefulLexer";
import {HtmlHighlighter} from "./highlighter/HtmlHighlighter";
import {Icon} from "../../../core/ui/icons/Icon";
import {FaIcon} from "../../../core/ui/icons/FaIcon";
import {ILexer} from "../../../lang/syntax/builder/lexer/ILexer";

/**
 *
 * @author Atzitz Amos
 * @date 9/17/2026
 * @since 1.0.0
 */
export default class HTMLLang extends LanguageBase {
    public static _instance: HTMLLang;

    private constructor() {
        super();
        HTMLLang._instance = this;
    }

    public static get INSTANCE(): HTMLLang {
        return HTMLLang._instance!;
    }

    public getKey(): string {
        return "html";
    }

    public getDisplayName(): string {
        return "HTML";
    }

    public getDefaultExtension(): string {
        return "html";
    }

    getIcon(): Icon | null {
        return FaIcon.brands("html5")
            .colored("#E34F26");
    }

    public createLexer(): ILexer {
        return new HtmlStatefulLexer();
    }

    public createHighlighter(): HighlighterBase {
        return new HtmlHighlighter();
    }
}
