import {Component} from "./Component";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export abstract class HtmlComponent implements Component {
    private parent: Component | null = null;

    private readonly element: HTMLElement;
    private readonly children: Component[] = [];

    protected constructor(element: HTMLElement) {
        this.element = element;
    }

    abstract draw(): void;

    getParent(): Component | null {
        return this.parent;
    }

    getUnderlyingElement(): HTMLElement {
        return this.element;
    }

    getChildren(): Component[] {
        return this.children;
    }

    getChild<T extends HtmlComponent>(cls: Class<T>): T | null {
        for (const child of this.children) {
            if (child instanceof cls) {
                return child;
            } else if (child instanceof HtmlComponent) {
                let found = child.getChild(cls);
                if (found !== null) {
                    return found;
                }
            }
        }
        return null;
    }

    addChild(child: Component): void {
        this.children.push(child);

        if (child instanceof HtmlComponent) {
            child.parent = this;
        }
    }

    addHtmlElement(element: HTMLElement): void {
        this.element.appendChild(element);
    }

    setInnerHTML(html: string): void {
        this.element.innerHTML = html;
    }

    protected drawChildren(): void {
        for (const child of this.children) {
            child.draw();
        }
    }
}
