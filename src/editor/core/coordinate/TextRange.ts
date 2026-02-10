export type HasRange = { range: TextRange };


/**
 * Represents a TextRange in the editor
 */
export class TextRange {
    isTracked: boolean;

    start: Offset;
    end: Offset;

    constructor(begin: Offset, end: Offset) {
        this.start = begin;
        this.end = end;
    }

    /**
     * Create a new TextRange around the supplied offset.
     * */
    static around(v: Offset): TextRange {
        return new TextRange(v, v + 1);
    }

    moveBy(offset: Offset) {
        this.start += offset;
        this.end += offset;
    }

    intersects(range: TextRange) {
        return this.start <= range.end && this.end >= range.start;
    }

    contains(offset: Offset): boolean ;

    contains(range: TextRange): boolean;

    contains(value: Offset | TextRange): boolean {
        if (value instanceof TextRange) {
            return this.start <= value.start && this.end >= value.end;
        }
        return this.start <= value && this.end >= value;
    }

    clone() {
        return new TextRange(this.start, this.end);
    }

    cloneNotTracked() {
        return new TextRange(this.start, this.end);
    }

    is(range: TextRange) {
        return this.start === range.start && this.end === range.end;
    }

    getLength() {
        return this.end - this.start;
    }

    delta(offset: Offset) {
        this.start += offset;
        this.end += offset;
    }

    toString() {
        return `[${this.start}, ${this.end}]`;
    }
}


export type TextContext = {
    begin: Offset;
    end: Offset;
    text: string;
};
