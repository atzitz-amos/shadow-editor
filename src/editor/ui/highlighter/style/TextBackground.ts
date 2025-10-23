/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributeBase} from "./TextAttributeBase";

export class TextBackground implements TextAttributeBase {
    public static readonly NONE = new TextBackground("transparent");

    private readonly background: string;

    constructor(background: string) {
        this.background = background;
    }

    apply(element: HTMLElement): void {
        element.style.background = this.background;
    }

}
