/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributeBase} from "./TextAttributeBase";

export class TextColor implements TextAttributeBase {
    public static readonly RED = new TextColor("red");
    public static readonly GREEN = new TextColor("green");
    public static readonly BLUE = new TextColor("blue");
    public static readonly BLACK = new TextColor("black");
    public static readonly WHITE = new TextColor("white");
    public static readonly YELLOW = new TextColor("yellow");
    public static readonly ORANGE = new TextColor("orange");
    public static readonly PURPLE = new TextColor("purple");
    public static readonly GRAY = new TextColor("gray");
    public static readonly BROWN = new TextColor("brown");
    public static readonly PINK = new TextColor("pink");
    public static readonly CYAN = new TextColor("cyan");
    public static readonly MAGENTA = new TextColor("magenta");

    private readonly color: string;

    constructor(color: string) {
        this.color = color;
    }

    apply(element: HTMLElement): void {
        element.style.color = this.color;
    }

    static of(color: string): TextColor {
        return new TextColor(color);

    }
}
