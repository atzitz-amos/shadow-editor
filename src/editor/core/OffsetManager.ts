import {PositionTuple, TextRangeManager} from "./Position";
import {EditorData} from "./data/data";

export class OffsetManager {
    data: EditorData;

    lineBreaks: Offset[] = [0]; // Start with the first line break at offset 0

    constructor(data: EditorData) {
        this.data = data;
    }

    public offsetToLogical(offset: number): PositionTuple {
        let lineBreak = this.findFirstAfter(this.lineBreaks, offset);
        let y = lineBreak === -1 ? this.lineBreaks.length - 1 : lineBreak - 1;
        let x = offset - this.lineBreaks[y];
        return new PositionTuple(x, y);
    }

    public absoluteToLogical(absolute: PositionTuple): PositionTuple {
        return absolute;
    }

    public logicalToAbsolute(logical: PositionTuple): PositionTuple {
        return logical;
    }

    public calculateOffset(logical: PositionTuple): number {
        return this.lineBreaks[logical.y] + logical.x;
    }

    offset(at: Offset, n: number): void {
        this._offsetList(this.lineBreaks, at, n);

        TextRangeManager.INSTANCE.updateRanges(at, n);
    }

    recomputeNewLines(at: Offset, text: string, deletion: boolean = false): void {
        let firstIndex = this.findFirstAfter(this.lineBreaks, at);
        if (firstIndex === -1) firstIndex = this.lineBreaks.length;
        for (const match of text.matchAll(/\r\n|\n|\r/g)) {
            if (deletion) {
                this.lineBreaks.splice(this.lineBreaks.indexOf(at + match.index! + match[0].length), 1);
            } else {
                let lineBreakOffset = at + match.index! + match[0].length;
                this.lineBreaks.splice(firstIndex, 0, lineBreakOffset);
                firstIndex++;
            }
        }
    }

    lineBegin(at: Offset): Offset {
        for (let i = 1; i < this.lineBreaks.length; i++) {
            if (at < this.lineBreaks[i]) {
                return this.lineBreaks[i - 1];
            }
        }
        return this.lineBreaks[this.lineBreaks.length - 1];
    }

    lineEnd(at: Offset): Offset {
        for (let i = 1; i < this.lineBreaks.length; i++) {
            if (at < this.lineBreaks[i]) {
                return this.lineBreaks[i] - 1;
            }
        }
        return this.data.raw.length(); // Return the end of the document if no line break is found
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