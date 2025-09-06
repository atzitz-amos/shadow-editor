import {EditorInstance} from "../../EditorInstance";
import {SRNode} from "../lang/parser/ast";
import {IScope} from "../lang/Scoping";


export type HasRange = { range: TextRange };


/**
 * This class store all ranges created using the `TextRange.new` method so that they can easily be updated
 *
 * This class requires the use of `EditorInstance` to work properly, as it is used to update ranges dynamically
 * */
export class TextRangeManager {

    private static _INSTANCES: Map<number, TextRangeManager> = new Map();
    private ranges: Set<WeakRef<TextRange>> = new Set();
    private rangesRegistry = new FinalizationRegistry<WeakRef<TextRange>>((heldValue) => {
        this.ranges.delete(heldValue);
    });

    static getInstance(): TextRangeManager {
        if (!TextRangeManager._INSTANCES.has(EditorInstance.Instance.id)) {
            TextRangeManager._INSTANCES.set(EditorInstance.Instance.id, new TextRangeManager());
        }
        return TextRangeManager._INSTANCES.get(EditorInstance.Instance.id)!;
    }

    add(range: TextRange) {
        const weakRef = new WeakRef(range);
        this.ranges.add(weakRef);
        this.rangesRegistry.register(range, weakRef);
    }

    updateRanges(at: Offset, offset: number) {
        for (const range of this.ranges) {
            const obj = range.deref();
            if (!obj) {
                this.ranges.delete(range);
                continue;
            }
            if (obj.begin > at) {
                obj.begin += offset;
            }
            if (obj.end >= at) {
                obj.end += offset;
            }
        }
    }
}

/**
 * Represents a TextRange in editor
 * This class actually uses an `TextRangeManager` to dynamically update editor ranges as needed */
export class TextRange {
    isTracked: boolean;

    begin: Offset;
    end: Offset;

    constructor(begin: Offset, end: Offset, isTracked: boolean = false) {
        if (isTracked)
            TextRangeManager.getInstance().add(this);

        this.isTracked = isTracked;
        this.begin = begin;
        this.end = end;
    }

    /**
     * Create a new TextRange containing all the supplied ranges. <span style="color: #c2f195">**WARNING**: This method always tracks the created range</span>
     * */
    static of(start: HasRange, end: HasRange): TextRange;
    static of(range: HasRange): TextRange;
    static of(values: (HasRange | null)[]): TextRange;
    static of(start: HasRange | (HasRange | null)[], end?: HasRange): TextRange {
        if (Array.isArray(start)) {
            let values = start.filter(v => v !== null);
            if (values.length == 1) {
                return values[0].range.clone();
            } else if (values.length == 0) {
                return new TextRange(0, 0);
            }
            return new TextRange(values[0].range.begin, values[values.length - 1].range.end, true);
        }
        if (end) {
            return new TextRange(start.range.begin, end.range.end, true);
        }
        return start.range.clone();
    }

    /**
     * Create a new TextRange around the supplied offset. <span style="color: #c2f195">**WARNING**: This method always tracks the created range</span>
     * */
    static around(v: Offset): TextRange {
        return new TextRange(v, v + 1, true);
    }

    /**
     * Create a new tracked TextRange
     * */
    static tracked(begin: Offset, end: Offset): TextRange {
        return new TextRange(begin, end, true);
    }

    moveBy(offset: Offset) {
        this.begin += offset;
        this.end += offset;
    }

    overlaps(range: TextRange) {
        return this.begin <= range.end && this.end >= range.begin;
    }

    contains(offset: Offset): boolean ;

    contains(range: TextRange): boolean;

    contains(value: Offset | TextRange): boolean {
        if (value instanceof TextRange) {
            return this.begin <= value.begin && this.end >= value.end;
        }
        return this.begin <= value && this.end >= value;
    }

    clone() {
        return new TextRange(this.begin, this.end, this.isTracked);
    }

    cloneNotTracked() {
        return new TextRange(this.begin, this.end, false);
    }
}


export type TextContext = {
    begin: Offset;
    end: Offset;
    text: string;
    scope: IScope;
    containingNode: SRNode;
};
