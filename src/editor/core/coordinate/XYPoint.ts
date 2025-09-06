export class XYPoint {
    __brand = 'point';  // branding to prevent structural typing

    x: int;
    y: int;

    constructor(x: int, y: int) {
        this.x = x;
        this.y = y;
    }
}