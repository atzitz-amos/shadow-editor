import {CommonKeyImpl, getCommonKeyValue, hasCommonKey} from "../../../utils/CommonKey";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export abstract class UIComponent {
    private root: HTMLElement | null = null;

    private readonly children: UIComponent[] = [];
    private parent: UIComponent | null = null;

    protected constructor(private readonly element: HTMLElement) {
        if (element.parentElement !== null) {
            this.root = element.parentElement;
        }
    }

    public getParent(): UIComponent | null {
        return this.parent;
    }

    public getChildren(): UIComponent[] {
        return this.children;
    }

    public getChildOfType<T extends UIComponent>(type: Class<T>): T[] {
        const result: T[] = [];
        for (const child of this.children) {
            if (child instanceof type) {
                result.push(child);
            } else {
                result.push(...child.getChildOfType(type));
            }
        }
        return result;
    }

    public getChild<T extends UIComponent>(type: Class<T>): T | null {
        for (const child of this.children) {
            if (child instanceof type) {
                return child;
            } else {
                const result = child.getChild(type);
                if (result !== null) {
                    return result;
                }
            }
        }
        return null;
    }

    public addChild(child: UIComponent): void {
        this.children.push(child);
        child.mount(this);
    }

    public dispose(): void {
        for (const child of this.children) {
            child.dispose();
        }
        if (this.parent !== null) {
            this.parent.getUnderlyingElement().removeChild(this.getUnderlyingElement());
        }
    }

    public abstract draw(): void;

    public getCommonKey<T>(key: CommonKeyImpl<T>): T | null {
        let result: T | null;
        if ((result = this.getCommonKeyDownward(key)) != null) {
            return result;
        } else if ((result = this.getCommonKeyUpward(key)) != null) {
            return result;
        }
        return null;
    }

    protected getUnderlyingElement(): HTMLElement {
        return this.element;
    }

    protected mount(parent: UIComponent) {
        if (!this.root) {
            this.root = parent.getUnderlyingElement();
            this.root.appendChild(this.getUnderlyingElement());
        }
        this.parent = parent;
    }

    protected drawChildren(): void {
        for (const child of this.children) {
            child.draw();
        }
    }

    protected setInnerHTML(html: string): void {
        this.getUnderlyingElement().innerHTML = html;
    }

    protected addHtmlElement(element: HTMLElement): void {
        this.getUnderlyingElement().appendChild(element);
    }

    private getCommonKeyUpward<T>(key: CommonKeyImpl<T>): T | null {
        if (hasCommonKey(this, key)) {
            return getCommonKeyValue(this, key);
        }
        if (this.parent !== null) {
            return this.parent.getCommonKeyUpward(key);
        }
        return null;
    }

    private getCommonKeyDownward<T>(key: CommonKeyImpl<T>): T | null {
        if (hasCommonKey(this, key)) {
            return getCommonKeyValue(this, key);
        }
        for (const child of this.children) {
            const result = child.getCommonKeyDownward(key);
            if (result !== null) {
                return result;
            }
        }
        return null;
    }
}
