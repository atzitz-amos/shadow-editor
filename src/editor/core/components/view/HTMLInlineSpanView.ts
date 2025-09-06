import {Editor} from "../../../Editor";
import {HTMLComponentView} from "./HTMLComponentView";
import {HTMLViewUtils} from "./HTMLViewUtils";
import {HTMLUtils} from "../../../utils/HTMLUtils";

export class HTMLInlineSpanView implements HTMLComponentView {
    private readonly stylesheet: CSSStyleDeclaration;

    constructor(private editor: Editor, private elements: HTMLElement[]) {
        this.stylesheet = HTMLViewUtils.createStyleProxy(elements);
    }

    addEventListener(event: string, listener: (e: any) => void): unknown {
        return this.elements.forEach(e => e.addEventListener(event, listener, true));
    }

    isInBound(x: number, y: number, delta: number = 5): boolean {
        return this.elements.some(e => HTMLUtils.isInBound(e, x, y, delta));
    }

    getCombinedChildren(): Element[] {
        return this.elements.map(x => x.children).reduce((a, b) => {
            let array = Array.from(a);
            array.push(...Array.from(b));
            return array;
        }, [] as Element[]);
    }

    getClassName(): string {
        let classNames: Set<string> = new Set<string>(this.elements.map(x => x.className.trim()).filter(x => x.length > 0).flatMap(x => x.split(" ")));
        return Array.from(classNames).join(" ");
    }

    getClientHeight(): number {
        return this.elements[0].clientHeight;
    }

    getClientWidth(): number {
        return this.elements.map(x => x.clientWidth).reduce((a, b) => a + b, 0);
    }

    getClientTop(): number {
        return this.elements[0].clientTop;
    }

    getClientLeft(): number {
        return this.elements[0].clientLeft;
    }

    getInnerHTML(): string {
        return this.elements.map(e => e.innerHTML).join("");
    }

    getTextContent(): string {
        return this.elements.map(e => e.textContent).join("");
    }

    getCommonTagName(): string {
        return this.elements[0].tagName;
    }

    getPreviousElementSibling(): HTMLElement | null {
        return this.elements[0].previousElementSibling as HTMLElement | null;
    }

    getNextElementSibling(): Element | null {
        return this.elements[this.elements.length - 1].nextElementSibling;
    }

    getParentElement(): HTMLElement | null {
        return this.elements[0].parentElement;
    }

    getCommonStylesheet(): CSSStyleDeclaration {
        return this.stylesheet;
    }

    getAssociatedElements(): HTMLElement[] {
        return this.elements;
    }

    getEditor(): Editor {
        return this.editor;
    }

    addClass(cls: string): void {
        this.elements.forEach(e => e.classList.add(cls));
    }

    removeClass(cls: string): void {
        this.elements.forEach(e => e.classList.remove(cls));
    }

}