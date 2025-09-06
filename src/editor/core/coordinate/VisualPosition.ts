export class VisualPosition {
    __brand = 'visual';  // branding to prevent structural typing

    col: int;
    row: int;

    constructor(col: int, row: int) {
        this.col = col;
        this.row = row;
    }

    isAfter(other: VisualPosition): boolean {
        return this.row > other.row || (this.row === other.row && this.col > other.col);
    }

    is(other: VisualPosition): boolean {
        return this.row === other.row && this.col === other.col;
    }
}