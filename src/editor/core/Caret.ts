import {Editor} from "../Editor";
import {Position, PositionTuple} from "./Position";


export class Caret {
    id: number = 0;

    isPrimary: boolean;

    position: Position;
    editor: Editor;
    vertMovementPos: Offset = 0;

    constructor(editor: Editor, isPrimary: boolean, position: Position) {
        this.editor = editor;
        this.isPrimary = isPrimary;
        this.position = position;
    }

    moveToLogical(x: number, y: number): void;
    moveToLogical(logical: PositionTuple): void;
    moveToLogical(pos: number | PositionTuple, y?: number) {
        let position: Position;
        if (typeof pos === "number") {
            position = this.position.createLogical(pos, y as int);
        } else {
            position = this.position.createLogical(pos.x, pos.y);
        }
        let old = this.position;
        this.position = position;

        this.editor.fire("onCaretMove", this, old, position);
    }

    moveToAbsolute(x: number, y: number): void;
    moveToAbsolute(absolute: Position): void;
    moveToAbsolute(pos: number | Position, y?: number) {
        if (typeof pos === "number") {
            pos = this.position.createAbsolute(pos, y as int);
        } else {
            pos = this.position.createAbsolute(pos.x, pos.y);
        }
        let old = this.position;
        this.position = pos;
        this.editor.fire("onCaretMove", this, old, pos);
    }

    shift(offset: Offset = 1): void {
        let oldOffset = this.position.offset;
        this.position.offset += offset;
        this.editor.fire("onCaretMove", this, Position.fromOffset(this.editor, oldOffset), this.position);
        this.vertMovementPos = 0;
    }

    setVertMovementPos(): void {
        this.vertMovementPos = Math.max(this.vertMovementPos, this.position.x);
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
        this.carets.push(new Caret(editor, true, editor.createLogical(0, 0)));
    }

    get primary(): Caret {
        return this.carets.find(caret => caret.isPrimary)!;
    }

    addCaret(position: Position) {
        const caret = new Caret(this.editor, false, position);
        this.carets.push(caret);
        return caret;
    }

    forEachCaret(callback: (caret: Caret) => void) {
        for (const caret of this.carets) {
            callback(caret);
        }
    }

    shift(offset: Offset) {
        this.forEachCaret(caret => caret.shift(offset));
    }

    clearAll() {
        for (let i = 0; i < this.carets.length; i++) {
            if (!this.carets[i].isPrimary) {
                this.carets[i].remove();
                this.carets.splice(i, 1);
                i--;
            }
        }
    }
}