import {Position} from "./Position";
import {Caret} from "./Caret";
import {ModifierKeyHolder} from "./events/keybind";


export enum SelectionDirection {
    LEFT,
    RIGHT,
    UNKNOWN
}

export class SelectionModel {
    isSelectionActive: boolean;
    caret: Caret;

    start: Position | null;
    end: Position | null = null;

    constructor(caret: Caret) {
        this.caret = caret;
        this.isSelectionActive = false;
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
    }

    onCaretMove(): void {
        if (!ModifierKeyHolder.isShiftPressed && !ModifierKeyHolder.isDragging) {
            this.setStart(this.caret.position)
            return this.clear();
        }
        this.setEnd(this.caret.position);
        if (!this.isSelectionActive) {
            this.setActive(true);
        }
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
    }
}