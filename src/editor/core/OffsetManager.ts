import {PositionTuple} from "./Position";
import {EditorData} from "./data/data";

export class OffsetManager {
    data: EditorData;

    lineBreaks: Offset[] = [0]; // Start with the first line break at offset 0

    constructor(data: EditorData) {
        this.data = data;
    }

    public offsetToLogical(offset: number): PositionTuple {
        let lineBreak = this.findFirstAfter(this.lineBreaks, offset);
        let y = lineBreak === -1 ? 0 : lineBreak - 1;
        let x = offset - this.lineBreaks[y];
        return new PositionTuple(x, y);
    }

    public absoluteToLogical(absolute: PositionTuple): PositionTuple {
        return;
    }

    public logicalToAbsolute(logical: PositionTuple): PositionTuple {
        return;
    }

    public calculateOffset(logical: PositionTuple): number {
        return this.lineBreaks[logical.y] + logical.x;

    }

    offset(at: Offset, n: number): void {
        this._offsetList(this.lineBreaks, at, n);
    }

    recomputeNewLines(at: Offset, text: string): void {
        let firstIndex = this.findFirstAfter(this.lineBreaks, at);
        if (firstIndex === -1) firstIndex = this.lineBreaks.length;
        for (const match of text.matchAll(/\r\n|\n|\r/g)) {
            let lineBreakOffset = at + match.index! + match[0].length;
            this.lineBreaks.splice(firstIndex, 0, lineBreakOffset);
            firstIndex++;
        }
    }

    /** Return the content surrounding the `at` position such that the relexing / reparsing of that area is sufficient. */
    withContext(at: Offset): TextContext {
        return {
            begin: this.lineBegin(at),
            end: this.lineEnd(at),
            text: this.withLine(at)
        };  // TODO
    }

    lineBegin(at: Offset): Offset {
        let firstIndex = this.findFirstAfter(this.lineBreaks, at) - 1;
        if (firstIndex === -2) {
            firstIndex = 0;
        }
        return this.lineBreaks[firstIndex];
    }

    lineEnd(at: Offset): Offset {
        let firstIndex = this.findFirstAfter(this.lineBreaks, at);
        if (firstIndex === -1) {
            return this.data.raw.length(); // Return the end of the document if no line break is found
        }
        return this.lineBreaks[firstIndex];
    }

    withLine(at: Offset): string {
        return this.data.raw.substring(this.lineBegin(at), this.lineEnd(at));
    }

    private findFirstAfter(list: Offset[], offset: Offset): number {
        for (let i = 0; i < list.length; i++) {
            if (list[i] > offset) {
                return i;
            }
        }
        return -1;
    }

    private _offsetList(list: Offset[], at: Offset, n: number): void {
        let index = this.findFirstAfter(list, at);
        if (index === -1) {
            // No line breaks after the given offset, just return
            return;
        }
        for (let i = index; i < list.length; i++) {
            list[i] += n;
        }
    }
}