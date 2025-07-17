import {Editor} from "../Editor";

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
    logical: PositionTuple;

    static fromOffset(editor: Editor, offset: Offset) {
        const logical = editor.offsetToLogical(offset);
        return new this(editor, logical);
    }

    static fromLogical(editor: Editor, x: int, y: int) {
        return new this(editor, new PositionTuple(x, y));
    }

    static fromAbsolute(editor: Editor, x: int, y: int) {
        return new this(editor, editor.absoluteToLogical(x, y));
    }

    static fromVisual(editor: Editor, x: int, y: int) {
        return new this(editor, editor.visualToNearestLogical(x, y));
    }

    private constructor(editor: Editor, logical: PositionTuple) {
        this.editor = editor;
        this.logical = logical;
    }

    set(x: int, y: int) {
        this.logical.x = x;
        this.logical.y = y;
    }

    get x() {
        return this.logical.x;
    }

    get y() {
        return this.logical.y;
    }

    set x(value) {
        this.logical.x = value;
    }

    set y(value) {
        this.logical.y = value;
    }

    get offset(): Offset {
        return this.editor.calculateOffset(this.logical);
    }

    set offset(value: Offset) {
        const logical = this.editor.offsetToLogical(value);
        this.set(logical.x, logical.y);
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
        return this.logical;
    }

    toAbsolute(): PositionTuple {
        return this.editor.logicalToAbsolute(this.logical);
    }

    toVisual(): PositionTuple {
        return this.editor.logicalToVisual(this.logical);
    }

    toOffset(): Offset {
        return this.editor.calculateOffset(this.logical);
    }
}