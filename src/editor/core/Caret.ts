import {Editor} from "../Editor";
import {Position} from "./Position";


export class Caret {
    isPrimary: boolean;
    position: Position;
    id: number = 0;

    constructor(isPrimary: boolean, position: Position) {
        this.isPrimary = isPrimary;
        this.position = position;
    }

    moveToLogical(x: number, y: number): void;
    moveToLogical(logical: Position): void;
    moveToLogical(pos: number | Position, y?: number) {
        if (typeof pos === "number") {
            this.position.set(pos, y as int);
        } else {
            this.position = pos;
        }
    }

    moveToAbsolute(x: number, y: number): void;
    moveToAbsolute(absolute: Position): void;
    moveToAbsolute(pos: number | Position, y?: number) {
        if (typeof pos === "number") {
            this.position = this.position.createAbsolute(pos, y as int);
        } else {
            this.position = this.position.createAbsolute(pos.x, pos.y);
        }
    }

    shift(offset: Offset) {
        this.position.offset += offset;
    }
}


export class CaretModel {
    editor: Editor;
    carets: Caret[] = [];

    constructor(editor: Editor) {
        this.editor = editor;
        this.carets.push(new Caret(true, editor.createLogical(0, 0)));
    }

    addCaret(position: Position) {
        const caret = new Caret(false, position);
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
}