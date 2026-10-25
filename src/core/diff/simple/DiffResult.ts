import {DiffChange, DiffHunk} from "./DiffChange";

/**
 * The changes turning an old sequence into a new one, as computed by {@link SimpleDiff}.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class DiffResult<T> {
    constructor(private readonly changes: readonly DiffChange<T>[]) {
    }

    /** Every run of the diff in order, equal runs included */
    getChanges(): readonly DiffChange<T>[] {
        return this.changes;
    }

    isIdentical(): boolean {
        return this.changes.every(change => change.type === "equal");
    }

    getInsertedCount(): number {
        return this.count("insert");
    }

    getDeletedCount(): number {
        return this.count("delete");
    }

    /**
     * Groups the changes into hunks, each surrounded by up to {@code context} unchanged items. Changes closer
     * than twice the context share a hunk.
     */
    toHunks(context: number = 3): DiffHunk<T>[] {
        const hunks: DiffHunk<T>[] = [];
        let current: DiffChange<T>[] = [];

        const flush = () => {
            if (current.some(change => change.type !== "equal")) hunks.push(DiffResult.toHunk(current));
            current = [];
        };

        this.changes.forEach((change, i) => {
            if (change.type !== "equal") {
                current.push(change);
                return;
            }

            const isFirst = i === 0, isLast = i === this.changes.length - 1;
            const items = change.items;
            if (!isFirst && !isLast && items.length <= context * 2) {
                // Short enough to keep the changes around it in one hunk
                current.push(change);
                return;
            }

            // Trailing context of the hunk being built, then leading context of the next one
            if (!isFirst) current.push(DiffResult.slice(change, 0, Math.min(context, items.length)));
            flush();
            if (!isLast) {
                const start = Math.max(0, items.length - context);
                current.push(DiffResult.slice(change, start, items.length));
            }
        });
        flush();

        return hunks;
    }

    /**
     * The diff in the unified format: "@@ -1,3 +1,4 @@" headers, then lines prefixed with " ", "-" or "+".
     *
     * @param format turns an item into its text, String() by default
     */
    toUnifiedString(context: number = 3, format: (item: T) => string = String): string {
        const lines: string[] = [];
        for (const hunk of this.toHunks(context)) {
            // Line numbers are 1-based; an empty range points at the line before it
            const oldStart = hunk.oldLength === 0 ? hunk.oldStart : hunk.oldStart + 1;
            const newStart = hunk.newLength === 0 ? hunk.newStart : hunk.newStart + 1;
            lines.push(`@@ -${oldStart},${hunk.oldLength} +${newStart},${hunk.newLength} @@`);

            for (const change of hunk.changes) {
                const prefix = change.type === "equal" ? " " : change.type === "delete" ? "-" : "+";
                change.items.forEach(item => lines.push(prefix + format(item)));
            }
        }
        return lines.join("\n");
    }

    private count(type: DiffChange<T>["type"]): number {
        return this.changes.filter(change => change.type === type).reduce((sum, change) => sum + change.items.length, 0);
    }

    private static slice<T>(change: DiffChange<T>, start: number, end: number): DiffChange<T> {
        return {
            type: change.type,
            oldIndex: change.oldIndex + start,
            newIndex: change.newIndex + start,
            items: change.items.slice(start, end)
        };
    }

    private static toHunk<T>(changes: DiffChange<T>[]): DiffHunk<T> {
        const first = changes[0];
        let oldLength = 0, newLength = 0;
        for (const change of changes) {
            if (change.type !== "insert") oldLength += change.items.length;
            if (change.type !== "delete") newLength += change.items.length;
        }
        return {oldStart: first.oldIndex, oldLength, newStart: first.newIndex, newLength, changes};
    }
}
