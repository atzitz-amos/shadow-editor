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
    private myCurrentInlaySlot: InlayRecord | null = null;

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
        return this.editor.logicalToXY(this.getLogical());
    }

    setVertMovementPos(): void {
        this.myVertMovementPos = Math.max(this.myVertMovementPos, this.myLogical.col);
    }

    onCaretMove(old: LogicalPosition) {
        this.editor.fire("onCaretMove", this, old, this.myLogical);

        this.selectionModel.onCaretMove();
    }

    moveToOffset(offset: Offset): void {
        this.moveToLogical(this.editor.offsetToLogical(offset));
    }

    moveToInlayAwareOffset(offset: Offset): void {
    }

    moveToLogical(logical: LogicalPosition): void {
        let old = this.myLogical;

        this.myLogical = logical;
        this.myVisual = this.editor.logicalToVisual(logical);

        this.myCurrentInlaySlot = null;

        this.onCaretMove(old);
    }


    shiftRight(withInlays: boolean = false): void {
        if (withInlays) {
            const inlay = this.editor.getInlayManager().getInlayAt(this.getOffset());
            if (inlay && this.myCurrentInlaySlot !== null) {
                this.moveToOffset(this.getOffset() + 1);
            } else if (inlay) {
                this.myVisual.col++;
                this.myCurrentInlaySlot = inlay;
            }
        } else {
            this.moveToOffset(this.getOffset() + 1);
        }
        this.myVertMovementPos = 0;
    }

    shiftLeft(withInlays: boolean = false): void {

    }

    remove() {
        this.editor.fire("onCaretRemove", this);
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