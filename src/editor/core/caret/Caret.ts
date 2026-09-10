import {Editor} from "../../Editor";
import {SelectionModel} from "./Selection";
import {LogicalPosition} from "../coordinate/LogicalPosition";
import {VisualPosition} from "../coordinate/VisualPosition";
import {CaretMovedEvent} from "./events/CaretMovedEvent";
import {CaretRemovedEvent} from "./events/CaretRemovedEvent";
import {CaretAddedEvent} from "./events/CaretAddedEvent";

export enum CaretMovementFlags {
    NONE = 0,
    IGNORE_INLAYS = 1,
    IGNORE_SELECTION = 2,
    NO_SCROLL = 4,

    JUMP = IGNORE_SELECTION | NO_SCROLL,
    DEFAULT = NONE,
}

export class Caret {
    id: number = 0;

    editor: Editor;
    caretModel: CaretModel;

    isPrimary: boolean;

    myVertMovementPos: Offset = 0;

    selectionModel: SelectionModel;

    private myLogical: LogicalPosition;
    private myVisual: VisualPosition;

    constructor(caretModel: CaretModel, pos: LogicalPosition, isPrimary: boolean) {
        this.caretModel = caretModel;
        this.editor = caretModel.editor;
        this.isPrimary = isPrimary;

        this.myLogical = pos;
        this.myVisual = this.editor.logicalToVisual(pos);

        this.selectionModel = new SelectionModel(this);

        this.editor.getEventBus().syncPublish(new CaretAddedEvent(this));
    }


    getSelectionModel(): SelectionModel {
        return this.selectionModel;
    }

    getLogical() {
        return this.myLogical;
    }

    getVisual() {
        return this.myVisual;
    }

    getOffset() {
        return this.editor.logicalToOffset(this.myLogical)
    }

    getXY() {
        return this.editor.visualToXY(this.getVisual());
    }

    setVertMovementPos(): void {
        this.myVertMovementPos = Math.max(this.myVertMovementPos, this.myLogical.col);
    }

    onCaretMove(old: LogicalPosition, flags: number) {
        this.editor.getEventBus().syncPublish(new CaretMovedEvent(this, old, this.myLogical, flags));

        this.selectionModel.onCaretMove((flags & CaretMovementFlags.IGNORE_SELECTION) === 0);
    }

    moveToOffset(offset: Offset, flags = CaretMovementFlags.DEFAULT): void {
        const document = this.editor.getOpenedDocument();

        if (offset < 0) offset = 0;
        else if (offset > document.getTotalDocumentLength()) offset = document.getTotalDocumentLength();

        this.moveToLogical(this.editor.offsetToLogical(offset), flags);
    }

    moveToInlayAwareOffset(offset: Offset): void {
    }

    moveToLogical(logical: LogicalPosition, flags = CaretMovementFlags.DEFAULT): void {
        let old = this.myLogical;

        this.myLogical = logical;
        this.myVisual = this.editor.logicalToVisual(logical);

        this.onCaretMove(old, flags);
    }


    moveToVisual(visual: VisualPosition, flags = CaretMovementFlags.DEFAULT) {
        this.myVisual = visual;
        let old = this.myLogical;
        this.myLogical = this.editor.visualToLogical(visual);

        this.onCaretMove(old, flags);
    }

    shiftRight(flags: CaretMovementFlags = CaretMovementFlags.DEFAULT): void {
        this.myVertMovementPos = 0;

        let currentOffset = this.getOffset();

        if (!(flags & CaretMovementFlags.IGNORE_INLAYS)) {
            const document = this.editor.getOpenedDocument();
            const inlay = this.editor.getInlayManager().getInlayAt(currentOffset)
            if (currentOffset !== document.getLineEnd(currentOffset) || inlay) {
                this.myVisual.col++;
                this.moveToVisual(this.myVisual, flags);
                return;
            }
        }
        this.moveToOffset(currentOffset + 1, flags);
    }

    shiftLeft(flags: CaretMovementFlags = CaretMovementFlags.DEFAULT): void {
        this.myVertMovementPos = 0;

        let currentOffset = this.getOffset();

        if (!(flags & CaretMovementFlags.IGNORE_INLAYS)) {
            const inlay = this.editor.getInlayManager().getInlayAt(currentOffset - 1)
            if (currentOffset !== this.editor.getOpenedDocument().getLineStart(currentOffset) || inlay) {
                this.myVisual.col--;
                this.moveToVisual(this.myVisual, flags);
                return;
            }
        }

        this.moveToOffset(currentOffset - 1, flags);
    }

    remove() {
        this.editor.getEventBus().syncPublish(new CaretRemovedEvent(this));
    }

    refresh() {
        this.myLogical = this.editor.visualToLogical(this.myVisual);
    }

    isBeforeInlay() {
        const inlay = this.editor.getInlayManager().getInlayAt(this.getOffset());
        if (inlay) {  // We now need to check if we are before or after the inlay
            if (this.getVisual().col === this.editor.logicalToVisual(this.getLogical()).col) {
                return true;
            }
        }
        return false;
    }

    getSelectedText() {
        const selection = this.getSelectionModel().getRange();
        return selection == null ? null : this.editor.getOpenedDocument().substring(selection.start, selection.end);
    }
}


export class CaretModel {
    editor: Editor;
    carets: Caret[] = [];

    constructor(editor: Editor, initialPos: LogicalPosition) {
        this.editor = editor;
        this.carets.push(new Caret(this, initialPos, true));
    }

    getPrimary(): Caret {
        return this.carets.find(caret => caret.isPrimary)!;
    }

    addCaret(position: LogicalPosition) {
        const caret = new Caret(this, position, this.carets.length == 0);
        this.carets.push(caret);
        return caret;
    }

    forEachCaret(callback: (caret: Caret) => void) {
        for (const caret of this.carets) {
            callback(caret);
        }
    }

    shift(offset: Offset) {
        this.forEachCaret(caret => caret.moveToOffset(offset + caret.getOffset()));
    }

    removeAll() {
        for (let i = 0; i < this.carets.length; i++) {
            if (!this.carets[i].isPrimary) {
                this.carets[i].remove();
                this.carets.splice(i, 1);
                i--;
            }
        }
    }

    removeAllIncludingPrimary() {
        for (const caret of this.carets) {
            caret.remove();
        }
        this.carets = [];
    }
}