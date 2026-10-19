import {UIComponentMixin} from "../../../../core/ui/engine/components/UIComponent";
import {Focusable} from "../../../../core/ui/engine/mixins/Focusable";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {SearchResult} from "../../../../core/search/SearchProcessor";
import {HighlightedFragment} from "../../../../core/ui/lib/highlight/HighlightedFragment";
import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import JsLang from "../../../../plugins/jsLang/lang/JsLang";
import {LogicalPosition} from "../../../../editor/core/coordinate/LogicalPosition";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";

/** Results rendered initially, and added per "show more". */
const PAGE_SIZE = 50;
/** Long (e.g. minified) lines are cut to this many characters, keeping some context before the first match. */
const PREVIEW_MAX_LENGTH = 200;
const PREVIEW_CONTEXT = 60;

/**
 *
 * @author Atzitz Amos
 * @date 10/17/2026
 * @since 1.0.0
 */
export class FindResultsListComponent extends UIComponentMixin(Focusable) {
    private results: SearchResult[] = [];
    private byFile: Map<string, LogicalPosition[]> | undefined;

    private onResultConfirmed: undefined | ((result: SearchResult) => void);
    private onSelectedResultChanged: undefined | ((result: SearchResult | undefined, byFile: Map<string, LogicalPosition[]>) => void);

    private selectedIndex: number = 0;

    /** How many results may be rendered; the rest wait behind the "show more" row. */
    private limit: number = PAGE_SIZE;
    private renderedCount: number = 0;
    private readonly showMoreElement: HTMLElement;

    constructor(parent: HTMLElement, private readonly input: HTMLInputElement) {
        super(HTMLUtils.createDiv("find-search-results", parent));

        this.showMoreElement = document.createElement("div");
        this.showMoreElement.classList.add("find-search-show-more");
        this.showMoreElement.addEventListener("mousedown", e => e.preventDefault()); // keep focus in the input
        this.showMoreElement.addEventListener("click", () => this.showMore());

        input.addEventListener("keydown", e => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                // Moving past the last rendered result reveals the next page
                if (this.selectedIndex === this.renderedCount - 1 && this.renderedCount < this.results.length) {
                    this.showMore();
                }
                if (this.selectedIndex < this.renderedCount - 1) {
                    this.selectedIndex++;
                    this.onSelectedChange();
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                    this.onSelectedChange();
                }
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (this.onResultConfirmed && this.results[this.selectedIndex]) {
                    this.onResultConfirmed(this.results[this.selectedIndex]);
                }
            }
        });
    }

    private static previewWindow(result: SearchResult): { text: string, offset: number } {
        const line = result.line;
        if (line.length <= PREVIEW_MAX_LENGTH) return {text: line, offset: 0};

        const firstMatch = result.appears[0]?.start ?? 0;
        const offset = Math.max(0, Math.min(firstMatch - PREVIEW_CONTEXT, line.length - PREVIEW_MAX_LENGTH));
        return {text: line.slice(offset, offset + PREVIEW_MAX_LENGTH), offset};
    }

    public setOnResultConfirmed(callback: (result: SearchResult) => void): void {
        this.onResultConfirmed = callback;
    }

    public setOnSelectedResultChanged(callback: (result: SearchResult | undefined, byFile: Map<string, LogicalPosition[]>) => void): void {
        this.onSelectedResultChanged = callback;
    }

    public resetResults() {
        this.results = [];
        this.byFile = undefined;
        this.selectedIndex = 0;
        this.limit = PAGE_SIZE;
        this.onSelectedChange();
        this.draw();
    }

    public updateResults(results: SearchResult[], byFile: Map<string, LogicalPosition[]> | undefined): void {
        const wasEmpty = this.results.length === 0;

        for (const result of results) this.results.push(result);
        this.byFile = byFile;

        this.renderPending();

        // Only the first batch changes what's selected (from nothing to the first result)
        if (wasEmpty && results.length > 0) {
            this.onSelectedChange();
        }
    }

    public showMore(): void {
        this.limit += PAGE_SIZE;
        this.renderPending();
    }

    public draw(): void {
        this.setInnerHTML("");
        this.renderedCount = 0;
        this.renderPending();
    }

    getResults() {
        return this.results;
    }

    /** Renders results up to the current limit in a single DOM insertion, keeping the "show more" row last. */
    private renderPending(): void {
        const end = Math.min(this.limit, this.results.length);
        if (end > this.renderedCount) {
            const fragment = document.createDocumentFragment();
            for (let i = this.renderedCount; i < end; i++) {
                fragment.appendChild(this.createResultElement(this.results[i], i));
            }
            this.renderedCount = end;
            this.getUnderlyingElement().insertBefore(fragment, this.showMoreElement.isConnected ? this.showMoreElement : null);
        }

        const hidden = this.results.length - this.renderedCount;
        if (hidden > 0) {
            this.showMoreElement.textContent = `Show ${Math.min(PAGE_SIZE, hidden)} more (${hidden} not shown)`;
            if (!this.showMoreElement.isConnected) this.addHtmlElement(this.showMoreElement);
        } else {
            this.showMoreElement.remove();
        }
    }

    private createResultElement(result: SearchResult, index: number): HTMLElement {
        const resultElement = document.createElement("div");
        resultElement.classList.add("find-search-result");

        const lineElement = document.createElement("div");
        lineElement.classList.add("find-search-result-line");

        const fileElement = document.createElement("div");
        fileElement.classList.add("find-search-result-file");
        fileElement.textContent = result.file.getPath().toString();

        resultElement.append(lineElement, fileElement);

        // Lexing and highlighting scale with the line length, so only the visible window is processed
        const {text, offset} = FindResultsListComponent.previewWindow(result);
        const fragment = new HighlightedFragment(lineElement, text, JsLang.INSTANCE);
        for (const range of result.appears) {
            const start = Math.max(range.start - offset, 0);
            const end = Math.min(range.end - offset, text.length);
            if (start < end) {
                fragment.addHighlight(new TextRange(start, end), TextAttributeKey.EMPTY, ["find-search-result-highlight"]);
            }
        }
        fragment.draw();

        resultElement.addEventListener("click", () => {
            this.selectedIndex = index;
            this.onSelectedChange();
            setTimeout(() => this.input.focus());
        });

        resultElement.addEventListener("dblclick", () => {
            this.selectedIndex = index;
            this.onSelectedChange();
            this.onResultConfirmed?.(result);
        });

        return resultElement;
    }

    private onSelectedChange() {
        setTimeout(() => {
            this.getUnderlyingElement().querySelector(".find-search-result.selected")?.classList.remove("selected");
            if (this.selectedIndex >= 0) {
                const selectedElement = this.getUnderlyingElement().children[this.selectedIndex];
                if (selectedElement) {
                    selectedElement.scrollIntoView({block: "nearest"});
                    selectedElement.classList.add("selected");
                }
            }
        }, 0);
        if (this.onSelectedResultChanged) {
            this.onSelectedResultChanged(this.results[this.selectedIndex], this.byFile!);
        }
    }
}
