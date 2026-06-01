import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {GlobalState} from "../../../../../../core/global/GlobalState";
import {CaretMovedEvent} from "../../../../../../editor/core/caret/events/CaretMovedEvent";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {CaretAddedEvent} from "../../../../../../editor/core/caret/events/CaretAddedEvent";
import {LanguageBase} from "../../../../../../core/lang/LanguageBase";
import {EditorLanguageChanged} from "../../../../../../editor/core/lang/events/EditorLanguageChanged";

export class SMetaRowView extends UIComponent {
    private language: string = "Plain Text";
    private lineCol: string = "Ln 0, Col 0";

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("editor-meta-row", root));

        GlobalState.getMainEventBus().subscribe(this, CaretAddedEvent.SUBSCRIBER, (event: CaretAddedEvent) => {
            if (event.getCaret().isPrimary) this.updateCaretPosition(event.getCaret().getLogical().row, event.getCaret().getLogical().col);
        });

        GlobalState.getMainEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, (event: CaretMovedEvent) => {
            if (event.getCaret().isPrimary) this.updateCaretPosition(event.getNewPosition().row, event.getNewPosition().col);
        });

        GlobalState.getMainEventBus().subscribe(this, EditorLanguageChanged.SUBSCRIBER, (event: EditorLanguageChanged) => {
            this.updateLanguage(event.getLanguage());
        });
    }

    draw(): void {
        this.getUnderlyingElement().innerHTML = `
            <span class="meta-lang-editor-info">${this.language}</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span class="meta-line-col-editor-info">${this.lineCol}</span>`;
        this.drawChildren();
    }

    private updateCaretPosition(row: number, col: number) {
        this.lineCol = `Ln ${row}, Col ${col}`;
        this.redraw();
    }

    private updateLanguage(lang: LanguageBase | null) {
        this.language = lang ? lang.getDisplayName() : "Plain Text";
        this.redraw();
    }
}

