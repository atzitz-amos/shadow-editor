/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributeBase} from "./TextAttributeBase";

export class TextAttributes {
    constructor(private attribute: TextAttributeBase[]) {
    }

    public static of(...attributes: TextAttributeBase[]): TextAttributes {
        return new TextAttributes(attributes);
    }

    public getAttributes(): TextAttributeBase[] {
        return this.attribute;
    }

    public with(attribute: TextAttributeBase): TextAttributes {
        return new TextAttributes([...this.attribute, attribute]);
    }

    public applyStyle(element: HTMLElement): void {
        for (const attr of this.attribute) {
            attr.apply(element);
        }
    }
}
