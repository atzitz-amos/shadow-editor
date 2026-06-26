import {Editor} from "../../../Editor";
import {Component} from "../../../core/components/Component";
import {TextAttributeKey} from "../../highlighter/style/TextAttributeKey";

/**
 * A proxy between an {@link Component} and it's associated {@link HTMLElement}
 *
 * Enables to query and modify simultaneously all associated {@link HTMLElement}*/
export interface HTMLView {
    getEditor(): Editor;

    getAssociatedElements(): HTMLElement[];

    getCombinedChildren(): Element[];

    getClassName(): string;

    getClientHeight(): number;

    getClientWidth(): number;

    getClientTop(): number;

    getClientLeft(): number;

    getInnerHTML(): string;

    getTextContent(): string;

    getCommonTagName(): string;

    getPreviousElementSibling(): Element | null;

    getNextElementSibling(): Element | null;

    getParentElement(): HTMLElement | null;

    getCommonStylesheet(): CSSStyleDeclaration;

    applyTextAttributes(attributes: TextAttributeKey): void;

    isInBound(x: number, y: number, delta?: number): boolean;

    addClass(cls: string): void;

    removeClass(cls: string): void;

    addEventListener(event: string, listener: (e: any) => void): unknown;

    getElementsAt(x: int, y: int): HTMLElement[];

    getBBox(): DOMRect;
}