import {HTMLUtils} from "../../../../../../core/utils/HTMLUtils";
import {GlobalState} from "../../../../../../core/global/GlobalState";
import {CaretMovedEvent} from "../../../../../../editor/core/caret/events/CaretMovedEvent";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {CaretAddedEvent} from "../../../../../../editor/core/caret/events/CaretAddedEvent";
import {LanguageBase} from "../../../../../../lang/LanguageBase";
import {EditorLanguageChanged} from "../../../../../../editor/core/lang/events/EditorLanguageChanged";
import {EditorModeChangedEvent} from "../../../../../../editor/core/behaviors/events/EditorModeChangedEvent";
import {IEditorMode} from "../../../../../../editor/core/behaviors/mode/IEditorMode";
import {Editor} from "../../../../../../editor/Editor";
import {MainEditorChangedEvent} from "../../../../events/MainEditorChangedEvent";

export class SMetaRowView extends UIComponent {
    private language: string = "Plain Text";
    private lineCol: string = "Ln 0, Col 0";
    private mode: IEditorMode | null = null;
    private mainEditor: Editor | null = null;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("editor-meta-row", root));

        GlobalState.getMainEventBus().subscribe(this, CaretAddedEvent.SUBSCRIBER, (event: CaretAddedEvent) => {
            if (event.getCaret().isPrimary) this.updateCaretPosition(event.getCaret().getLogical().row, event.getCaret().getLogical().col);
        });

        GlobalState.getMainEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, (event: CaretMovedEvent) => {
            if (event.getCaret().isPrimary) this.updateCaretPosition(event.getNewPosition().row, event.getNewPosition().col);
        });

        // The row describes the main editor only: other editors (dialogs, previews) publish these events as well
        GlobalState.getMainEventBus().subscribe(this, MainEditorChangedEvent.SUBSCRIBER, (event: MainEditorChangedEvent) => {
            this.mainEditor = event.getNewEditor();
            if (this.mainEditor) this.updateLanguage(this.mainEditor.getCurrentLanguage());
        });

        GlobalState.getMainEventBus().subscribe(this, EditorLanguageChanged.SUBSCRIBER, (event: EditorLanguageChanged) => {
            if (event.getEditor() === this.mainEditor) this.updateLanguage(event.getLanguage());
        });

        GlobalState.getMainEventBus().subscribe(this, EditorModeChangedEvent.SUBSCRIBER, (event: EditorModeChangedEvent) => {
            this.updateMode(event.getNewMode());
        });
    }

    draw(): void {
        this.getUnderlyingElement().innerHTML = `
        <div>
            <span class="meta-lang-editor-info">${this.language}</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span class="meta-line-col-editor-info">${this.lineCol}</span>
        </div>
        <div>
            <span class="meta-mode-editor-info">${this.mode?.getDisplayName() ?? ""}</span>
        </div>`;
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

    private updateMode(newMode: IEditorMode | null) {
        this.getUnderlyingElement().querySelector(".meta-mode-editor-info")!.textContent = newMode ? newMode.getDisplayName() : "";
        this.mode = newMode;
    }
}

