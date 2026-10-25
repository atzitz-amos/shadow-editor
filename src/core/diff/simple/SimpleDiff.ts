import {DiffChange, DiffChangeType, DiffEquality} from "./DiffChange";
import {DiffResult} from "./DiffResult";

export type LineDiffOptions = {
    /** Compares lines without their leading and trailing whitespace */
    ignoreWhitespace?: boolean,
    ignoreCase?: boolean
}

/**
 * A minimal diff between two sequences, using the Myers algorithm: it finds the shortest edit script in
 * O((N + M) · D) time, D being the number of inserted and deleted items, so similar inputs diff quickly.
 * The common prefix and suffix are skipped before running it.
 *
 * <pre>
 * SimpleDiff.diffLines(expected, actual).toUnifiedString()
 * SimpleDiff.diff(oldTokens, newTokens, (a, b) => a.text === b.text).getChanges()
 * </pre>
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SimpleDiff {
    /**
     * Diffs two sequences of items.
     *
     * @param equals how items are compared, strict equality by default
     */
    static diff<T>(oldItems: readonly T[], newItems: readonly T[], equals: DiffEquality<T> = (a, b) => a === b): DiffResult<T> {
        let prefix = 0;
        const maxPrefix = Math.min(oldItems.length, newItems.length);
        while (prefix < maxPrefix && equals(oldItems[prefix], newItems[prefix])) prefix++;

        let suffix = 0;
        const maxSuffix = maxPrefix - prefix;
        while (suffix < maxSuffix
        && equals(oldItems[oldItems.length - 1 - suffix], newItems[newItems.length - 1 - suffix])) suffix++;

        const oldMiddle = oldItems.slice(prefix, oldItems.length - suffix);
        const newMiddle = newItems.slice(prefix, newItems.length - suffix);

        const operations: DiffChangeType[] = [
            ...new Array<DiffChangeType>(prefix).fill("equal"),
            ...SimpleDiff.myers(oldMiddle, newMiddle, equals),
            ...new Array<DiffChangeType>(suffix).fill("equal")
        ];
        return new DiffResult(SimpleDiff.toChanges(operations, oldItems, newItems));
    }

    /**
     * Diffs two texts line by line. Line breaks may be "\n" or "\r\n".
     */
    static diffLines(oldText: string, newText: string, options: LineDiffOptions = {}): DiffResult<string> {
        const normalize = (line: string) => {
            if (options.ignoreWhitespace) line = line.trim();
            if (options.ignoreCase) line = line.toLowerCase();
            return line;
        };
        const equals: DiffEquality<string> = options.ignoreWhitespace || options.ignoreCase
            ? (a, b) => normalize(a) === normalize(b)
            : (a, b) => a === b;

        return SimpleDiff.diff(SimpleDiff.splitLines(oldText), SimpleDiff.splitLines(newText), equals);
    }

    private static splitLines(text: string): string[] {
        return text === "" ? [] : text.split(/\r?\n/);
    }

    /**
     * The shortest edit script from a to b, as one operation per item: "equal" consumes an item of both
     * sequences, "delete" one of a, "insert" one of b.
     */
    private static myers<T>(a: readonly T[], b: readonly T[], equals: DiffEquality<T>): DiffChangeType[] {
        const n = a.length, m = b.length;
        if (n === 0) return new Array<DiffChangeType>(m).fill("insert");
        if (m === 0) return new Array<DiffChangeType>(n).fill("delete");

        // v[k] is the furthest x reached on diagonal k = x - y, stored with an offset since k may be negative
        const max = n + m;
        const offset = max + 1;
        const v = new Int32Array(2 * max + 3);
        // Snapshot of v before each step d, restricted to the diagonals it can reach: only O(D²) memory
        const trace: Int32Array[] = [];

        for (let d = 0; d <= max; d++) {
            trace.push(v.slice(offset - d - 1, offset + d + 2));

            for (let k = -d; k <= d; k += 2) {
                // Come from the diagonal above (insertion) or below (deletion), whichever went further
                const down = k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1]);
                let x = down ? v[offset + k + 1] : v[offset + k - 1] + 1;
                let y = x - k;

                // Follow the diagonal: equal items cost nothing
                while (x < n && y < m && equals(a[x], b[y])) {
                    x++;
                    y++;
                }
                v[offset + k] = x;

                if (x >= n && y >= m) return SimpleDiff.backtrack(trace, n, m);
            }
        }
        throw new Error("Unreachable: the edit script is at most n + m long");
    }

    private static backtrack(trace: Int32Array[], n: number, m: number): DiffChangeType[] {
        const operations: DiffChangeType[] = [];
        let x = n, y = m;

        for (let d = trace.length - 1; d >= 0; d--) {
            const v = trace[d];
            // trace[d] starts at diagonal -d - 1
            const at = (k: number) => v[k + d + 1];

            const k = x - y;
            const down = k === -d || (k !== d && at(k - 1) < at(k + 1));
            const previousK = down ? k + 1 : k - 1;
            const previousX = at(previousK);
            const previousY = previousX - previousK;

            while (x > previousX && y > previousY) {
                operations.push("equal");
                x--;
                y--;
            }
            if (d > 0) operations.push(down ? "insert" : "delete");

            x = previousX;
            y = previousY;
        }
        return operations.reverse();
    }

    /** Groups the operations into runs, resolving the items and indices of each */
    private static toChanges<T>(operations: DiffChangeType[], oldItems: readonly T[], newItems: readonly T[]): DiffChange<T>[] {
        const changes: DiffChange<T>[] = [];
        let oldIndex = 0, newIndex = 0;

        for (let i = 0; i < operations.length;) {
            const type = operations[i];
            let length = 0;
            while (i < operations.length && operations[i] === type) {
                length++;
                i++;
            }

            const items = type === "insert"
                ? newItems.slice(newIndex, newIndex + length)
                : oldItems.slice(oldIndex, oldIndex + length);
            changes.push({type, oldIndex, newIndex, items});

            if (type !== "insert") oldIndex += length;
            if (type !== "delete") newIndex += length;
        }
        return changes;
    }
}
