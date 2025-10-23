/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextAttributeBase} from "./TextAttributeBase";

export class TextFontStyle implements TextAttributeBase {
    constructor(
        private weight: string | null = null,
        private style: string | null = null,
        private decoration: string | null = null,
        private decorationColor: string | null = null
    ) {
    }

    static of(...styles: TextFontStyle[]) {
        let weight: string | null = null,
            style: string | null = null,
            decoration: string | null = null,
            decorationColor: string | null = null;

        for (const s of styles) {
            if (s.weight) weight = s.weight;
            if (s.style) style = s.style;
            if (s.decoration) decoration = s.decoration;
            if (s.decorationColor) decorationColor = s.decorationColor;
        }
        return new TextFontStyle(weight, style, decoration, decorationColor);
    }

    apply(element: HTMLElement): void {
        element.style.fontWeight = this.weight || "normal";
        element.style.fontStyle = this.style || "normal";
        element.style.textDecoration = this.decoration || "none";
        if (this.decorationColor) {
            element.style.textDecorationColor = this.decorationColor;
        }
    }
}

export class TextFontStyleKeys {
    public static readonly DEFAULT = new TextFontStyle();
    public static readonly BOLD = new TextFontStyle("bold");
    public static readonly ITALIC = new TextFontStyle(null, "italic");
    public static readonly UNDERLINE = new TextFontStyle(null, null, "underline");
    public static readonly STRIKETHROUGH = new TextFontStyle(null, null, "line-through");

    public static UNDERLINE_COLOR(color: string): TextFontStyle {
        return new TextFontStyle(null, null, "underline", color);
    }

    public static STRIKETHROUGH_COLOR(color: string): TextFontStyle {
        return new TextFontStyle(null, null, "line-through", color);
    }
}