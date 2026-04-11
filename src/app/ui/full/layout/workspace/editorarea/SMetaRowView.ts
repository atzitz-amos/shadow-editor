import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {GlobalState} from "../../../../../../core/global/GlobalState";
import {CaretMovedEvent} from "../../../../../../editor/core/caret/events/CaretMovedEvent";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";

export class SMetaRowView extends UIComponent {
    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("editor-meta-row", root));

        GlobalState.getMainEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, (event: CaretMovedEvent) => {
            const el = this.getUnderlyingElement().querySelector(".meta-line-col-editor-info");
            if (el) {
                el.textContent = `Ln ${event.getNewPosition().row}, Col ${event.getNewPosition().col}`;
            }
        });
    }

    draw(): void {
        this.getUnderlyingElement().innerHTML = `
            <span>TypeScript</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span class="meta-line-col-editor-info">Ln 0, Col 0</span>`;
        this.drawChildren();
    }
}

