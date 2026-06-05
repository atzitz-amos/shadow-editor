import {TextRange} from "./TextRange";

/**
 * Represents a tracked range in the editor.
 * It moves along with document modifications and can be invalidated when the range is deleted.
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export class TrackedRange extends TextRange {
    private valid: boolean = true;
    private readonly greedyLeft: boolean;
    private readonly greedyRight: boolean;

    constructor(start: number, end: number, isGreedyLeft: boolean = false, isGreedyRight: boolean = false) {
        super(start, end);
        this.greedyRight = isGreedyRight;
        this.greedyLeft = isGreedyLeft;
    }

    static of(range: TextRange) {
        return new TrackedRange(range.getStart(), range.getEnd());
    }

    invalidate() {
        this.valid = false;
    }

    isValid() {
        return this.valid;
    }

    isGreedyLeft(): boolean {
        return this.greedyLeft;
    }

    isGreedyRight(): boolean {
        return this.greedyRight;
    }

    setStart(newStart: number) {
        if (!this.valid) return;
        this.start = newStart;
        if (this.start > this.end) {
            this.invalidate();
        }
    }

    setEnd(newEnd: number) {
        if (!this.valid) return;
        this.end = newEnd;
        if (this.end < this.start) {
            this.invalidate();
        }
    }
}
