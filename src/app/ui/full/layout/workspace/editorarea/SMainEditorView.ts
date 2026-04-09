import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {Editor} from "../../../../../../editor/Editor";
import {GlobalState} from "../../../../../../core/global/GlobalState";
import {UIResizeEvent} from "../../../../events/UIResizeEvent";
import {CaretMovedEvent} from "../../../../../../editor/core/caret/events/CaretMovedEvent";
import {Scheduler} from "../../../../../../core/scheduler/Scheduler";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {CommonKey} from "../../../../../../core/utils/CommonKey";
import {UICommonKeys} from "../../../../keys/UICommonKeys";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SMainEditorView extends UIComponent {
    private metaRowElement: HTMLElement;
    private readonly editorElement: HTMLElement;

    @CommonKey(UICommonKeys.MAIN_EDITOR)
    private currentEditor: Editor = new Editor({});

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-editor", root));

        this.metaRowElement = HTMLUtils.createDiv("editor-meta-row", this.getUnderlyingElement());
        this.editorElement = HTMLUtils.createDiv("column-editor-body", this.getUnderlyingElement());

        GlobalState.getMainEventBus().subscribe(this, UIResizeEvent.SUBSCRIBER, () => this.onResize());
        GlobalState.getMainEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, (event: CaretMovedEvent) => {
            const el = document.querySelector(".meta-line-col-editor-info");
            if (el) {
                el.textContent = `Ln ${event.getNewPosition().row}, Col ${event.getNewPosition().col}`;
            }
        });
    }

    draw(): void {
        this.metaRowElement.innerHTML = `
            <span>TypeScript</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span class="meta-line-col-editor-info">Ln 0, Col 0</span>`;

        this.currentEditor.attach(this.editorElement);

        Scheduler.defer(() => {
            const bbox = this.editorElement.getBoundingClientRect();
            this.currentEditor.setWidthHeight(bbox.width, bbox.height);
        });
    }

    getMainEditor() {
        return this.currentEditor;
    }

    private onResize() {
        Scheduler.defer(() => {
            const bbox = this.editorElement.getBoundingClientRect();
            this.currentEditor.setWidthHeight(bbox.width, bbox.height);
        });
    }
}
