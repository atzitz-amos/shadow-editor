import {CodeCompletionItem} from "../item/CodeCompletionItem";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {Document} from "../../../editor/core/document/Document";
import {TrackedRange} from "../../../editor/core/coordinate/range/TrackedRange";
import type {CompletionInfo} from "../manager/CompletionUtils";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export class CodeCompletionSession {
    private readonly range: TrackedRange;
    private readonly allCompletions: CodeCompletionItem[] = [];

    /** The length of the prefix before the last edit, used to tell where a deletion happened */
    private lastLength: number;

    private completionInfo: CompletionInfo | null = null;

    private disposed = false;

    constructor(private readonly document: Document,
                range: TextRange,
                private readonly isIdentifierPart: (ch: string) => boolean,
                /** Whether the user asked for the session, as opposed to it opening by itself while typing */
                private readonly manual: boolean = false) {
        // Both ends sticky: an empty prefix range must grow when the user types at the caret.
        this.range = new TrackedRange(range.start, range.end, true, true);
        this.document.addTrackedRange(this.range);
        this.lastLength = this.range.getLength();
    }

    getDocument(): Document {
        return this.document;
    }

    addCompletions(completions: CodeCompletionItem[]): void {
        if (this.disposed) return; // late result from a slow provider
        this.allCompletions.push(...completions);
    }

    getPrefix(): string {
        return this.document.getTextBetween(this.range.start, this.range.end);
    }

    /** The start of the prefix, where the popup is anchored */
    getPrefixStart(): Offset {
        return this.range.start;
    }

    /** Whether `offset` is inside the prefix, both ends included */
    containsOffset(offset: Offset): boolean {
        return this.range.isValid() && this.range.contains(offset);
    }

    /**
     * The range a completion replaces when applied, as a copy that does not follow later edits.
     *
     * @param wholeIdentifier also replace the part of the identifier that is after the caret
     */
    getReplacementRange(wholeIdentifier: boolean = false): TextRange {
        let end = this.range.end;
        if (wholeIdentifier) {
            const length = this.document.getTotalDocumentLength();
            while (end < length && this.isIdentifierPart(this.document.getTextBetween(end, end + 1))) end++;
        }
        return new TextRange(this.range.start, end);
    }

    getApplicableCompletions(): CodeCompletionItem[] {
        const prefix = this.getPrefix();
        return this.allCompletions.filter(c => c.isStillApplicable(prefix));
    }

    /**
     * Whether the session survives an edit at `offset`, in which case its completions only need to be refiltered.
     * Must be called once per edit, after the edit was applied to the document.
     */
    isSessionStillValid(offset: Offset, insertedText: string, deletedText: string): boolean {
        if (this.disposed || !this.range.isValid()) return false;

        // The edit must have happened inside the prefix. Because both ends are sticky,
        // an insertion at either end has already been absorbed into the range.
        if (!this.range.contains(offset)) return false;

        const length = this.range.getLength();

        // A deletion never invalidates the range, it only collapses the deleted part of it. And once collapsed,
        // a deletion inside the prefix and one just before it both leave `range.start === offset`: the only way
        // to tell them apart is that the former shrank the prefix by exactly the deleted length.
        // Deleting the whole prefix ends a session that opened by itself: it only existed because of what was
        // typed. One the user asked for stays, and every completion is applicable again.
        //
        // Anything other than a single identifier character (space, '(', '.') ends the session.
        const valid = insertedText.length === 0
            ? deletedText.length > 0 && length === this.lastLength - deletedText.length && (length > 0 || this.manual)
            : deletedText.length === 0 && insertedText.length === 1 && this.isIdentifierPart(insertedText);

        if (valid) this.lastLength = length;
        return valid;
    }

    dispose(): void {
        this.disposed = true;
        this.allCompletions.length = 0;
        this.range.invalidate();
    }

    setCompletionInfo(completionInfo: CompletionInfo) {
        this.completionInfo = completionInfo;
    }

    getCompletionInfo(): CompletionInfo | null {
        return this.completionInfo;
    }
}
