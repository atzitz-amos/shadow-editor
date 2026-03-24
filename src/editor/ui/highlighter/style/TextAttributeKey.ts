/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributeBase} from "./TextAttributeBase";

export class TextAttributeKey {
    constructor(private attribute: TextAttributeBase[]) {
    }

    public static of(...attributes: TextAttributeBase[]): TextAttributeKey {
        return new TextAttributeKey(attributes);
    }

    public getAttributes(): TextAttributeBase[] {
        return this.attribute;
    }

    public with(attribute: TextAttributeBase): TextAttributeKey {
        return new TextAttributeKey([...this.attribute, attribute]);
    }

    public applyStyle(element: HTMLElement): void {
        for (const attr of this.attribute) {
            attr.apply(element);
        }
    }
}
