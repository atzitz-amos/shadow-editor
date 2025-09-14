import {Caret} from "./Caret";
import {ModifierKeyHolder} from "./events/keybind";
import {Editor} from "../Editor";
import {LogicalPosition} from "./coordinate/LogicalPosition";


export enum SelectionDirection {
    LEFT,
    RIGHT,
    UNKNOWN
}

export class SelectionModel {
    editor: Editor;
    caret: Caret;

    isSelectionActive: boolean;

    startOffset: Offset | null;
    endOffset: Offset | null = null;

    constructor(caret: Caret) {
        this.editor = caret.editor;
        this.caret = caret;
        this.isSelectionActive = false;
    }

    getDirection(): SelectionDirection {
        if (!this.isSelectionActive || this.startOffset === null || this.endOffset === null) {
            return SelectionDirection.UNKNOWN;
        }
        if (this.startOffset < this.endOffset) {
            return SelectionDirection.RIGHT;
        } else {
            return SelectionDirection.LEFT;
        }
    }

    setStart(start: LogicalPosition): void {
        this.startOffset = this.editor.logicalToOffset(start);
    }

    setEnd(end: LogicalPosition): void {
        this.endOffset = this.editor.logicalToOffset(end);
    }

    setActive(active: boolean): void {
        this.isSelectionActive = active;
    }

    onCaretMove(): void {
        // TODO: introduce parameter `shouldEnableSelection` to indicate whether shift is pressed
        if (!ModifierKeyHolder.isShiftPressed && !ModifierKeyHolder.isDragging) {
            this.setStart(this.caret.getLogical())
            return this.clear();
        }
        this.setEnd(this.caret.getLogical());
        if (!this.isSelectionActive) {
            this.setActive(true);
        }
    }

    getStartOffset() {
        return this.startOffset;
    }

    getStart(): LogicalPosition {
        let start = this.startOffset;
        if (start === null) {
            return this.caret.getLogical();
        }
        return this.editor.offsetToLogical(start);
    }

    getActualStart(): LogicalPosition {
        if (!this.isSelectionActive || this.startOffset === null || this.endOffset === null) {
            return this.caret.getLogical();
        }
        let start = Math.min(this.startOffset, this.endOffset);
        return this.editor.offsetToLogical(start);
    }

    getEndOffset() {
        return this.endOffset;
    }

    getEnd(): LogicalPosition {
        let end = this.endOffset;
        if (end === null) {
            return this.caret.getLogical();
        }
        return this.editor.offsetToLogical(end);
    }

    getSelectionLength(): number {
        if (!this.isSelectionActive) return 0;
        return Math.abs(this.startOffset! - this.endOffset!);
    }

    select(from: number, to: number) {
        this.startOffset = from;
        this.endOffset = to;
        this.isSelectionActive = true;
    }

    clear(): void {
        this.setStart(this.caret.getLogical());
        this.isSelectionActive = false;
        this.endOffset = null;
    }
}
