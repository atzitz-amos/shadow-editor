import {Editor} from "../Editor";
import {EditorInstance} from "../EditorInstance";
import {SRNode} from "./lang/parser/ast";
import {IScope} from "./lang/Scoping";

export class PositionTuple {
    x: int;
    y: int;

    constructor(x: int, y: int) {
        this.x = x;
        this.y = y;
    }
}

/**
 * Position class used to represent any position of any component inside the editor
 * Composed of three components:
 * - Logical, the real offset in the text
 * - Linear, the linear offset in the text (fastest for lookup)
 * - Absolute, the offset after code folding, etc...
 * - Visual, the on-screen coords
 **/
export class Position {
    editor: Editor;

    private constructor(editor: Editor, offset: Offset) {
        this.editor = editor;
        this._offset = offset;
    }

    _offset: Offset;

    get offset(): Offset {
        return this._offset;
    }

    set offset(value: Offset) {
        if (value < 0) {
            this._offset = 0;
        } else if (value > this.editor.data.raw.length()) {
            this._offset = this.editor.data.raw.length();
        } else {
            this._offset = value;
        }
    }

    get x() {
        return this.toLogical().x;
    }

    get y() {
        return this.toLogical().y
    }

    static fromOffset(editor: Editor, offset: Offset) {
        return new this(editor, offset);
    }

    static fromLogical(editor: Editor, x: int, y: int) {
        return new this(editor, editor.calculateOffset(new PositionTuple(x, y)));
    }

    static fromAbsolute(editor: Editor, x: int, y: int) {
        return new this(editor, editor.absoluteToOffset(x, y));
    }

    static fromVisual(editor: Editor, x: int, y: int) {
        let logical = editor.visualToNearestLogical(x, y);
        return Position.fromLogical(editor, logical.x, logical.y);
    }

    set(x: int, y: int) {
        this._offset = this.editor.calculateOffset(new PositionTuple(x, y));
    }

    createLogical(x: int, y: int): Position {
        return Position.fromLogical(this.editor, x, y);
    }

    createAbsolute(x: int, y: int): Position {
        return Position.fromAbsolute(this.editor, x, y);
    }

    createVisual(x: int, y: int): Position {
        return Position.fromVisual(this.editor, x, y);
    }

    toLogical(): PositionTuple {
        return this.editor.offsetToLogical(this._offset);
    }

    toAbsolute(): PositionTuple {
        return this.editor.offsetToAbsolute(this._offset);
    }

    toVisual(): PositionTuple {
        return this.editor.logicalToVisual(this.toLogical());
    }

    toOffset(): Offset {
        return this._offset;
    }

    isEOL() {
        return this.editor.offsetManager.lineEnd(this._offset) === this._offset;
    }

    isBOL() {
        return this.editor.offsetManager.lineBegin(this._offset) === this._offset;
    }
}

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

    static get INSTANCE(): TextRangeManager {
        if (!TextRangeManager._INSTANCES.has(EditorInstance.INSTANCE.id)) {
            TextRangeManager._INSTANCES.set(EditorInstance.INSTANCE.id, new TextRangeManager());
        }
        return TextRangeManager._INSTANCES.get(EditorInstance.INSTANCE.id)!;
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
    begin: Offset;
    end: Offset;

    constructor(begin: Offset, end: Offset) {
        TextRangeManager.INSTANCE.add(this);

        this.begin = begin;
        this.end = end;
    }

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
            return new TextRange(values[0].range.begin, values[values.length - 1].range.end);
        }
        if (end) {
            return new TextRange(start.range.begin, end.range.end);
        }
        return start.range.clone();
    }


    static around(v: Offset): TextRange {
        return new TextRange(v, v + 1);
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
        return new TextRange(this.begin, this.end);
    }
}


export type TextContext = {
    begin: Offset;
    end: Offset;
    text: string;
    scope: IScope;
    containingNode: SRNode;
};
