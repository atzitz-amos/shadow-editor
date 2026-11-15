import {UIComponent} from "../../engine/components/UIComponent";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {LangRegistry} from "../../../../lang/LangRegistry";
import {DocumentAgnosticHighlightHolder} from "../../../../editor/ui/highlighter/DocumentAgnosticHighlightHolder";
import {SimpleHighlighter} from "../../../highlighter/SimpleHighlighter";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import {HighlightHolder} from "../../../../editor/ui/highlighter/HighlightHolder";
import {UIComponentElement} from "../elements/UIComponentElement";
import {CustomElementsRegistry} from "../CustomElementsRegistry";

/**
 *
 * @author Atzitz Amos
 * @date 10/4/2026
 * @since 1.0.0
 */
export class HighlightedFragment extends UIComponent {
    private readonly holder: HighlightHolder;
    private readonly text: string;

    constructor(parent: HTMLElement | null, fragment: string, language: LanguageBase | null) {
        super(HTMLUtils.createElement("div.highlighted-fragment", parent ?? undefined));
        this.text = fragment;

        const holder = new DocumentAgnosticHighlightHolder(0);
        if (language !== null) {
            const lexer = LangRegistry.getLexer(language);
            const stream = lexer.lexAllToTokens(fragment);
            LangRegistry.getHighlighter(language).highlight(stream, holder);
        }

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

/**
 * {@code <ide-code lang="js">const a = 1;</ide-code>}: highlights its text content with the language of the given
 * key, or shows it as plain text when there is no such language.
 * <p>
 * The text can be changed as that of any element ({@code textContent}, {@code innerHTML}, {@code append}...), and is
 * highlighted again right after.
 */
class _CustomIdeCode extends UIComponentElement<HighlightedFragment> {
    private readonly observer = new MutationObserver(() => this.rebuild());
    private source = "";

    static get observedAttributes() {
        return ["lang"];
    }

    /** The highlighted text */
    get code(): string {
        return this.source;
    }

    set code(value: string) {
        this.textContent = value;
    }

    connectedCallback() {
        super.connectedCallback();
        this.observer.observe(this, {childList: true, characterData: true});
    }

    disconnectedCallback() {
        this.observer.disconnect();
    }

    protected rebuild() {
        // Whatever the element contains now is the text to highlight, the previous rendering included
        this.source = this.textContent ?? "";
        this.textContent = "";
        super.rebuild();

        // Ignores the mutations made by the rendering itself
        this.observer.takeRecords();
    }

    protected createComponent(): HighlightedFragment {
        const lang = this.getAttribute("lang");
        return new HighlightedFragment(null, this.source, lang ? LangRegistry.getLanguageByKey(lang) : null);
    }
}

CustomElementsRegistry.register("ide-code", _CustomIdeCode);
