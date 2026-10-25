export type DiffChangeType = "equal" | "insert" | "delete";

/**
 * A run of consecutive items that are kept, inserted or deleted.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export interface DiffChange<T> {
    readonly type: DiffChangeType;
    /**
     * Index of the first item in the old sequence. For an insertion, the index before which the items are
     * inserted.
     */
    readonly oldIndex: number;
    /**
     * Index of the first item in the new sequence. For a deletion, the index at which the items would have been.
     */
    readonly newIndex: number;
    /** The items, taken from the old sequence for equal and deleted runs, from the new one for insertions */
    readonly items: readonly T[];
}

/**
 * A group of changes with the unchanged items around them, as shown in a unified diff.
 */
export interface DiffHunk<T> {
    readonly oldStart: number;
    readonly oldLength: number;
    readonly newStart: number;
    readonly newLength: number;
    readonly changes: readonly DiffChange<T>[];
}

export type DiffEquality<T> = (a: T, b: T) => boolean;
