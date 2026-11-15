import {TextRange} from "../../../core/text/range/TextRange";

/**
 * The text of a document.
 * <p>
 * Backed by a plain string. The engine already represents the result of a concatenation or of a slice lazily, as a
 * rope of its own, so an edit does not copy the whole text, and reading it back ({@link toString}) costs nothing:
 * the view and the lexer do that on every repaint and on every edit.
 * <p>
 * This used to be a hand-written rope that was never rebalanced: each edit made the tree two levels deeper, so
 * edits got slower as they accumulated, and its recursive traversals overflowed the stack after a few thousand of
 * them. A structure replacing this one has to keep its depth bounded, whatever the number of edits.
 */
export class EditorRawData {
    private text: string;

    constructor(initialString: string = "") {
        this.text = initialString;
    }

    /**
     * @throws Error if `i` is past the end of the text
     */
    index(i: number): string {
        if (i >= this.text.length) throw new Error("Index out of bounds");
        return this.text[i];
    }

    toString(): string {
        return this.text;
    }

    /** An `index` outside of the text is clamped to its closest end */
    insert(index: number, str: string): void {
        this.text = this.text.substring(0, index) + str + this.text.substring(index);
    }

    /**
     * Deletes up to `length` characters from `start`, fewer if the text ends before that.
     * @returns the deleted text
     */
    delete(start: number, length: number): string {
        const from = Math.max(0, Math.min(start, this.text.length));
        const to = Math.min(from + Math.max(0, length), this.text.length);

        const deleted = this.text.substring(from, to);
        this.text = this.text.substring(0, from) + this.text.substring(to);
        return deleted;
    }

    length(): number {
        return this.text.length;
    }

    /**
     * @throws Error if the range is not within the text
     */
    substring(start: number, end?: number): string {
        const len = this.text.length;
        if (end === undefined) {
            end = len;
        }
        if (start < 0 || end > len || start > end) {
            throw new Error("Invalid range for substring");
        }
        return this.text.substring(start, end);
    }

    getTextInRange(range: TextRange): string {
        return this.substring(range.start, range.end);
    }
}
