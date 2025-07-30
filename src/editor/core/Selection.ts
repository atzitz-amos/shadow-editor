import {Position} from "./Position";
import {Editor} from "../Editor";
import {EditorEventListener} from "./events/events";
import {Caret} from "./Caret";
import {ModifierKeyHolder} from "./events/keybind";


export enum SelectionDirection {
    LEFT,
    RIGHT,
    UNKNOWN
}

export class SelectionModel implements EditorEventListener {
    isSelectionActive: boolean;
    caret: Caret;

    start: Position | null;
    end: Position | null = null;

    constructor(caret: Caret) {
        this.caret = caret;
        this.isSelectionActive = false;

        this.caret.editor.addEditorEventListener(this);
    }

    get direction(): SelectionDirection {
        if (!this.isSelectionActive || !this.start || !this.end) {
            return SelectionDirection.UNKNOWN;
        }
        if (this.start.offset < this.end.offset) {
            return SelectionDirection.RIGHT;
        } else {
            return SelectionDirection.LEFT;
        }
    }

    setStart(start: Position): void {
        this.start = start.clone();
    }

    setEnd(end: Position): void {
        this.end = end.clone();
    }

    setActive(active: boolean): void {
        this.isSelectionActive = active;
    }

    clear(): void {
        this.isSelectionActive = false;
        this.setStart(this.caret.position);
        this.end = null;

        console.log("Selection cleared.");
    }

    onCaretMove(editor: Editor, caret: Caret, oldPos: Position, newPos: Position): void {
        if (!ModifierKeyHolder.isShiftPressed && !ModifierKeyHolder.isDragging) {
            this.setStart(caret.position)
            return this.clear();
        }
        this.setEnd(caret.position);
        if (!this.isSelectionActive) {
            this.setActive(true);
        }
    }

    onCaretRemove(editor: Editor, caret: Caret): void {
        throw new Error("Method not implemented.");
    }

    getStart(): Position {
        let start = this.start || this.caret.position;
        if (this.end && this.end.offset < start.offset) {
            return this.end;
        }
        return start;
    }

    getEnd(): Position {
        let end = this.end || this.caret.position;
        if (this.start && this.start.offset > end.offset) {
            return this.start;
        }
        return end;
    }

    set(start: number, end: number) {
        this.start = Position.fromOffset(this.caret.editor, start);
        this.end = Position.fromOffset(this.caret.editor, end);
        this.isSelectionActive = true;

        console.log(`Selection set from ${start} to ${end}.`);
    }
}