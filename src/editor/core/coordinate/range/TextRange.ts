import {Serializable, SerializableType} from "../../../../core/persistence/serializable/Serializable";

export type HasRange = { range: TextRange };

/**
 * Represents a TextRange in the editor
 */
export class TextRange implements Serializable {
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

    getStart() {
        return this.start;
    }

    getEnd() {
        return this.end;
    }

    serialize(): SerializableType {
        return {
            start: this.start,
            end: this.end
        };
    }

    moveBy(offset: Offset) {
        this.start += offset;
        this.end += offset;
    }

    intersects(other: TextRange) {
        return this.start <= other.getEnd() && this.end >= other.getStart();
    }

    contains(offset: Offset): boolean ;

    contains(range: TextRange): boolean;

    contains(value: Offset | TextRange): boolean {
        if (typeof value === "number") {
            return this.start <= value && this.end >= value;
        }
        return this.start <= value.getStart() && this.end >= value.getEnd();
    }

    clone() {
        return new TextRange(this.start, this.end);
    }

    is(range: TextRange) {
        return this.start === range.start && this.end === range.end;
    }

    getLength() {
        return this.end - this.start;
    }

    delta(offset: Offset) {
        return new TextRange(this.start + offset, this.end + offset);
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
