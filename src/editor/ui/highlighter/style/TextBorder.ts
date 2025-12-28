/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributeBase} from "./TextAttributeBase";

export class TextBorder implements TextAttributeBase {
    constructor(
        public style: BorderStyle = BorderStyle.SOLID,
        public width: number = 1,
        public color: string = "#000000"
    ) {
    }

    apply(element: HTMLElement): void {
        element.style.border = `${this.width}px ${this.style} ${this.color}`;
    }
}

export enum BorderStyle {
    NONE = "none",
    SOLID = "solid",
    DOTTED = "dotted",
    DASHED = "dashed",
    DOUBLE = "double",
    GROOVE = "groove",
    RIDGE = "ridge",
    INSET = "inset",
    OUTSET = "outset"
}

export class TextBorderKeys {
    public static readonly NONE = new TextBorder(BorderStyle.NONE, 0, "transparent");
    public static readonly SOLID_WHITE = new TextBorder(BorderStyle.SOLID, 1, "#fff");

    public static SOLID(width: number): TextBorder;

    public static SOLID(color: string): TextBorder;

    public static SOLID(width: number, color: string): TextBorder;

    public static SOLID(a: number | string, b?: string) {
        if (typeof a === "number") {
            return new TextBorder(BorderStyle.SOLID, a, b || "#fff");
        }
        return new TextBorder(BorderStyle.SOLID, 1, a);
    }
}
