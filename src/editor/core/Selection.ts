import {Position} from "./Position";


export enum SelectionDirection {
    LEFT,
    RIGHT,
    UNKNOWN
}

export class SelectionModel {
    start: Position;
    end: Position;
    direction: SelectionDirection;
}