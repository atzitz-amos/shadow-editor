import {UIComponent} from "../../engine/components/UIComponent";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {LangRegistry} from "../../../../lang/LangRegistry";
import {DocumentAgnosticHighlightHolder} from "../../../../editor/ui/highlighter/DocumentAgnosticHighlightHolder";
import {SimpleHighlighter} from "../../../highlighter/SimpleHighlighter";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import {HighlightHolder} from "../../../../editor/ui/highlighter/HighlightHolder";

/**
 *
 * @author Atzitz Amos
 * @date 10/4/2026
 * @since 1.0.0
 */
export class HighlightedFragment extends UIComponent {
    private readonly holder: HighlightHolder;
    private readonly text: string;

    constructor(parent: HTMLElement, fragment: string, language: LanguageBase) {
        super(HTMLUtils.createElement("div.highlighted-fragment", parent));
        this.text = fragment;
        const lexer = LangRegistry.getLexer(language);
        const stream = lexer.lexAllToTokens(fragment);
        const highlighter = LangRegistry.getHighlighter(language);

        const holder = new DocumentAgnosticHighlightHolder(0);
        highlighter.highlight(stream, holder);

        this.holder = holder;
    }

    addHighlight(range: TextRange, key: TextAttributeKey, className?: string[]) {
        this.holder.highlightRange(range, key, className);
    }

    public draw(): void {
        this.setInnerHTML("");
        new SimpleHighlighter(this.holder.toFragments()).renderInto(this.getUnderlyingElement(), this.text);
    }
}
