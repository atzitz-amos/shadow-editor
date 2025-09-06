import {Document} from "./Document";
import {TextRange} from "../coordinate/TextRange";

export class LineData {

    constructor(private document: Document, private lineno: number, private lineStart: number, private lineEnd: number) {
    }

    public getStart(): Offset {
        return this.lineStart;
    }

    public getEnd(): Offset {
        return this.lineEnd;
    }

    public getAssociatedRange(): TextRange {
        return new TextRange(this.lineStart, this.lineEnd);
    }

    public getLineLength() {
        return this.lineEnd - this.lineStart;
    }

    public getLineNumber(): int {
        return this.lineno;
    }

    public getText(): string {
        return this.document.getTextBetween(this.lineStart, this.lineEnd);
    }

    public charAt(i: number) {
        return this.document.getTextBetween(this.lineStart + i, this.lineStart + i + 1);
    }
}