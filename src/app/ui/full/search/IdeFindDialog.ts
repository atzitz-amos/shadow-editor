import {AbstractDialog} from "../../../../core/ui/lib/dialog/IdeDialog";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {GlobalState} from "../../../../core/global/GlobalState";
import {Scheduler} from "../../../../core/scheduler/Scheduler";
import {SearchProcessor, SearchResult} from "../../../../core/search/SearchProcessor";
import {FindResultsListComponent} from "./FindResultsListComponent";
import {LightEditor} from "../../../../editor/light/LightEditor";
import {DocumentView} from "../../../../editor/core/document/view/DocumentView";
import {EditorDocumentManager} from "../../../../editor/core/document/EditorDocumentManager";
import {EditorHighlighterUtils} from "../../../../editor/ui/highlighter/overlay/EditorHighlighterUtils";
import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import {TextBackground} from "../../../../editor/ui/highlighter/style/TextBackground";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {LogicalPosition} from "../../../../editor/core/coordinate/LogicalPosition";
import {URINavigationManager} from "../../../../core/uri/URINavigationManager";
import {CaretMovementFlags} from "../../../../editor/core/caret/Caret";

const MAX_PREVIEW_HIGHLIGHTS = 1000;

/**
 *
 * @author Atzitz Amos
 * @date 10/4/2026
 * @since 1.0.0
 */
export class IdeFindDialog extends AbstractDialog {
    private readonly root: HTMLElement;

    private searchId: number = 0;

    private readonly resultsList: FindResultsListComponent;
    private lightEditor: LightEditor | undefined;
    private lastFileId: string | undefined = undefined;

    constructor() {
        super();

        this.root = HTMLUtils.createElement("div.ide-find-dialog.no-results");
        this.root.style.top = "300px";
        this.root.setAttribute("tabindex", "0");
        this.root.innerHTML = `
            <div class="find-search-header">Find everywhere</div>
            <div class="find-search-bar">
            </div>
            <div class="find-search-results-count">
            </div>
        `;

        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", "Search...");
        input.classList.add("find-search-bar-input");

        input.addEventListener("input", e => {
            Scheduler.debounce(() => this.onInput(input), 200);
        });

        this.root.querySelector(".find-search-bar")!.appendChild(input);

        setTimeout(() => {
            (this.root.querySelector(".find-search-bar-input") as HTMLElement).focus();
        }, 0);

        this.resultsList = new FindResultsListComponent(this.root, input);
        this.resultsList.setOnSelectedResultChanged((result, byFile) => this.onSelected(result, byFile));
        this.resultsList.setOnResultConfirmed(result => this.onConfirmed(result))

        HTMLUtils.createDiv("find-search-separator", this.root)

        const editorContainer = HTMLUtils.createDiv("find-search-light-editor", this.root);
        editorContainer.style.display = "none";
        this.lightEditor = undefined;
    }

    protected getPopupElement(): HTMLElement {
        return this.root;
    }

    private async onInput(input: HTMLInputElement) {
        this.lastFileId = undefined;
        this.resultsList.resetResults();
        this.root.classList.add("no-results");
        this.root.querySelector(".find-search-results-count")!.textContent = "Searching...";

        const query = input.value.trim();
        if (query === "") {
            this.searchId++;
            this.root.querySelector(".find-search-results-count")!.textContent = "";
            return;
        }

        const processor = new SearchProcessor(GlobalState.getCurrentProject().getFS().getRoot());
        const id = ++this.searchId;

        const start = performance.now();
        let count = 0;
        for await (const batch of processor.batchSearch(query)) {
            if (id !== this.searchId) {
                break;
            }

            if (batch.results.length > 0) {
                this.resultsList.updateResults(batch.results, batch.byFile);
                this.root.classList.remove("no-results");
                count += batch.results.length;
            } else if (count === 0) {
                this.root.classList.add("no-results");
            }

            const timeMs = performance.now() - start;
            this.root.querySelector(".find-search-results-count")!.textContent = `${count} results · ${Math.round(timeMs)}ms · Searching...`;
        }
        if (id === this.searchId) {
            this.root.querySelector(".find-search-results-count")!.textContent = `${count} results · ${Math.round(performance.now() - start)}ms`;
        }
    }

    private onSelected(result: SearchResult | undefined, byFile: Map<string, LogicalPosition[]>) {
        if (!result) {
            (this.root.querySelector(".find-search-light-editor") as HTMLElement).style.display = "none";
        } else {
            const container = this.root.querySelector(".find-search-light-editor") as HTMLElement;
            if (!this.lightEditor || this.lastFileId !== result.file.getId()) {
                const document = EditorDocumentManager.getDocumentForFile(result.file);
                const view = new DocumentView(EditorDocumentManager.getDocumentId(document), 0, 0, document.getLineData(result.lineNo - 1).getStart() + result.appears[0].start);

                if (!this.lightEditor) {
                    this.lightEditor = new LightEditor(view);
                    this.lightEditor.attach(container);
                    Scheduler.defer(() => this.lightEditor!.setWidthHeight(container.clientWidth, container.clientHeight))
                } else {
                    this.lightEditor.changeDocument(view);
                }

                // One overlay widget per match, passed as spread arguments: bound it so common queries can't stall or overflow the stack
                const logicalPositions = (byFile.get(result.file.getId()) || []).slice(0, MAX_PREVIEW_HIGHLIGHTS);
                EditorHighlighterUtils.highlight(
                    this.lightEditor,
                    "find-search-highlight",
                    TextAttributeKey.of(new TextBackground("#20486a80")),
                    null,
                    ...logicalPositions.map(x => {
                        const offset = this.lightEditor!.logicalToOffset(x);
                        return new TextRange(offset, offset + result.query.length)
                    }))
                container.style.display = "block";
                this.lastFileId = result.file.getId();
            } else {
                this.lightEditor.getPrimaryCaret().moveToLogical(new LogicalPosition(result.appears[0].start, result.lineNo - 1), CaretMovementFlags.IGNORE_SELECTION);
            }

            setTimeout(() => this.lightEditor?.getView().ensureCaretVisible(3), 0);
        }
    }

    private onConfirmed(result: SearchResult) {
        const uri = result.file.getURI();
        URINavigationManager.navigateAsync(uri);
        this.close(false);
    }
}
