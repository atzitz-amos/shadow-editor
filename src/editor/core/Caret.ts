import {Editor} from "../Editor";
import {SelectionModel} from "./Selection";
import {LogicalPosition} from "./coordinate/LogicalPosition";
import {VisualPosition} from "./coordinate/VisualPosition";
import {InlayRecord} from "./inlay/InlayManager";


export class Caret {
    id: number = 0;

    editor: Editor;
    caretModel: CaretModel;

    isPrimary: boolean;

    myVertMovementPos: Offset = 0;

    selectionModel: SelectionModel;

    private myLogical: LogicalPosition;
    private myVisual: VisualPosition;

    constructor(caretModel: CaretModel, isPrimary: boolean) {
        this.caretModel = caretModel;
        this.editor = caretModel.editor;
        this.isPrimary = isPrimary;

        this.myLogical = new LogicalPosition(0, 0);
        this.myVisual = new VisualPosition(0, 0);

        this.selectionModel = new SelectionModel(this);
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
        return this.editor.logicalToOffset(this.myLogical);
    }

    getXY() {
        return this.editor.visualToXY(this.getVisual());
    }

    setVertMovementPos(): void {
        this.myVertMovementPos = Math.max(this.myVertMovementPos, this.myLogical.col);
    }

    onCaretMove(old: LogicalPosition) {
        this.editor.fire("onCaretMove", this, old, this.myLogical);

        this.selectionModel.onCaretMove();
    }

    moveToOffset(offset: Offset): void {
        const document = this.editor.getOpenedDocument();

        if (offset < 0) offset = 0;
        else if (offset > document.getTotalDocumentLength()) offset = document.getTotalDocumentLength();

        this.moveToLogical(this.editor.offsetToLogical(offset));
    }

    moveToInlayAwareOffset(offset: Offset): void {
    }

    moveToLogical(logical: LogicalPosition): void {
        let old = this.myLogical;

        this.myLogical = logical;
        this.myVisual = this.editor.logicalToVisual(logical);

        this.onCaretMove(old);
    }


    moveToVisual(visual: VisualPosition) {
        this.myVisual = visual;
        let old = this.myLogical;
        this.myLogical = this.editor.visualToLogical(visual);

        this.onCaretMove(old);
    }

    shiftRight(withInlays: boolean = true): void {
        this.myVertMovementPos = 0;

        let currentOffset = this.getOffset();

        if (withInlays) {
            const document = this.editor.getOpenedDocument();
            const inlay = this.editor.getInlayManager().getInlayAt(currentOffset)
            if (currentOffset !== document.getLineEnd(currentOffset) || inlay) {
                console.log(1);
                this.myVisual.col++;
                this.moveToVisual(this.myVisual);
                return;
            }
        }
        this.moveToOffset(currentOffset + 1);
    }

    shiftLeft(withInlays: boolean = true): void {
        this.myVertMovementPos = 0;

        let currentOffset = this.getOffset();

        if (withInlays) {
            const inlay = this.editor.getInlayManager().getInlayAt(currentOffset - 1)
            if (currentOffset !== this.editor.getOpenedDocument().getLineStart(currentOffset) || inlay) {
                this.myVisual.col--;
                this.moveToVisual(this.myVisual);
                return;
            }
        }

        this.moveToOffset(currentOffset - 1);
    }

    remove() {
        this.editor.fire("onCaretRemove", this);
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
    }
}


export class CaretModel {
    editor: Editor;
    carets: Caret[] = [];

    constructor(editor: Editor) {
        this.editor = editor;
        this.carets.push(new Caret(this, true));
    }

    getPrimary(): Caret {
        return this.carets.find(caret => caret.isPrimary)!;
    }

    addCaret(position: LogicalPosition) {
        const caret = new Caret(this, false);
        // TODO set caret position

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
}