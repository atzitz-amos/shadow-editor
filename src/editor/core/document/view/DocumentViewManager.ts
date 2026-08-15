import {Document} from "../Document";
import {DocumentView} from "./DocumentView";
import {Persisted} from "../../../../core/persistence/objects/Persisted";
import {EditorDocumentManager} from "../EditorDocumentManager";
import {Service} from "../../../../core/threaded/service/Service";
import {GlobalState} from "../../../../core/global/GlobalState";
import {CaretMovedEvent} from "../../caret/events/CaretMovedEvent";
import {ProjectFile} from "../../../../core/project/filesystem/tree/ProjectFile";
import {Scheduler} from "../../../../core/scheduler/Scheduler";
import {Scrolling} from "../../../ui/scrollbar/Scrolling";

/**
 *
 * @author Atzitz Amos
 * @date 8/10/2026
 * @since 1.0.0
 */
@Service
export class DocumentViewManager {
    @Persisted({
        deserializer: d => d.use(DocumentView, DocumentView.deserializer),
        mutable: true
    })
    private static accessor documentViews: Map<string, DocumentView> = new Map();

    private static readonly instance = new DocumentViewManager();

    public static getInstance(): DocumentViewManager {
        return this.instance;
    }

    public static getSavedDocumentView(document: Document): DocumentView {
        const file = document.getAssociatedFile();
        if (!file) return new DocumentView(EditorDocumentManager.getDocumentId(document), 0, 0, 0);

        if (!this.documentViews.has(file.getId())) {
            this.documentViews.set(file.getId(), new DocumentView(EditorDocumentManager.getDocumentId(document), 0, 0, 0));
        }

        return this.getCachedDocumentView(file)!;
    }

    private static getCachedDocumentView(file: ProjectFile) {
        return this.documentViews.get(file.getId());
    }

    public begin(): void {
        GlobalState.getMainEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, e => {
            Scheduler.debounce(
                () => {
                    const view = DocumentViewManager.getSavedDocumentView(e.getEditor().getOpenedDocument());
                    view.setCaretOffset(e.getEditor().logicalToOffset(e.getNewPosition()));
                }, 1000);
        });

        Scrolling.addScrollListener((doc, x, y) => {
            Scheduler.debounce(() => {
                const view = DocumentViewManager.getSavedDocumentView(doc);
                console.log("Scroll", x, y);
                view.setScrollX(x);
                view.setScrollY(y);
            }, 1000);
        })
    }
}