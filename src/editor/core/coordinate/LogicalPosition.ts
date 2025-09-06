export class LogicalPosition {
    __brand = 'logical';  // branding to prevent structural typing

    col: int;
    row: int;

    constructor(col: int, row: int) {
        this.col = col;
        this.row = row;
    }

    is(other: LogicalPosition): boolean {
        return this.row === other.row && this.col === other.col;
    }
}