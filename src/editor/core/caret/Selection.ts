import {Caret} from "./Caret";
import {ModifierKeyHolder} from "../../../core/keybinds/Keybind";
import {Editor} from "../../Editor";
import {LogicalPosition} from "../coordinate/LogicalPosition";
import {TextRange} from "../coordinate/range/TextRange";
import {TrackedRange} from "../coordinate/range/TrackedRange";


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

    private trackedRange: TrackedRange | null = null;

    constructor(caret: Caret) {
        this.editor = caret.editor;
        this.caret = caret;
        this.isSelectionActive = false;
    }

    private get actualStartOffset() {
        return this.startOffset !== null && this.endOffset !== null ? Math.min(this.startOffset, this.endOffset) : null;
    }

    private get actualEndOffset() {
        return this.startOffset !== null && this.endOffset !== null ? Math.max(this.startOffset, this.endOffset) : null;
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
        if (this.endOffset !== null)
            this.trackedRange = this.editor.getOpenedDocument().createTracked(this.actualStartOffset!, this.actualEndOffset!);
    }

    setEnd(end: LogicalPosition): void {
        this.endOffset = this.editor.logicalToOffset(end);
        if (this.startOffset !== null)
            this.trackedRange = this.editor.getOpenedDocument().createTracked(this.actualStartOffset!, this.actualEndOffset!);
    }

    setActive(active: boolean): void {
        this.isSelectionActive = active;
        if (!active || this.actualStartOffset === null || this.actualEndOffset === null)
            this.trackedRange = null;
        else
            this.trackedRange = this.editor.getOpenedDocument().createTracked(this.actualStartOffset, this.actualEndOffset);
    }

    onCaretMove(): void {
        // TODO: introduce parameter `shouldEnableSelection` to indicate whether shift is pressed
        if (!ModifierKeyHolder.isShiftPressed() && !ModifierKeyHolder.isDragging()) {
            return this.clear();
        }
        this.endOffset = this.caret.getOffset();
        this.setActive(true);
    }

    getStartOffset() {
        return this.startOffset;
    }

    getEndOffset() {
        return this.endOffset;
    }

    getActualStart(): Offset {
        if (!this.trackedRange) {
            return this.caret.getOffset();
        }
        return this.trackedRange.start;
    }

    getActualEnd(): Offset {
        if (!this.trackedRange) {
            return this.caret.getOffset();
        }
        return this.trackedRange.end;
    }

    getStart(): LogicalPosition {
        let start = this.getActualStart();
        if (start === null) {
            return this.caret.getLogical();
        }
        return this.editor.offsetToLogical(start);
    }

    getEnd(): LogicalPosition {
        let end = this.getActualEnd();
        if (end === null) {
            return this.caret.getLogical();
        }
        return this.editor.offsetToLogical(end);
    }

    getRange(): TextRange | null {
        return this.trackedRange;
    }

    getSelectionLength(): number {
        if (!this.isSelectionActive) return 0;
        return Math.abs(this.startOffset! - this.endOffset!);
    }

    select(from: number, to: number) {
        this.startOffset = from;
        this.endOffset = to;
        this.isSelectionActive = true;
        this.trackedRange = this.editor.getOpenedDocument().createTracked(this.actualStartOffset!, this.actualEndOffset!);
    }

    clear(): void {
        this.setStart(this.caret.getLogical());
        this.isSelectionActive = false;
        this.startOffset = this.caret.getOffset();
        this.endOffset = null;
    }

    getOrigin() {
        if (!this.trackedRange) {
            return null;
        }
        if (this.startOffset! <= this.endOffset!) return this.trackedRange.start;
        return this.trackedRange.end;
    }
}
