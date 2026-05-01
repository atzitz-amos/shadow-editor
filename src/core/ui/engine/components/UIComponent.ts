import {CommonKeyImpl, getCommonKeyValue, hasCommonKey} from "../../../utils/CommonKey";
import {UIEnhancer} from "../enhancer/UIEnhancer";
import {UIHooks} from "../listeners/hooks/UIHooks";


export abstract class UIComponent {
    private static readonly elementRegistry = new WeakMap<HTMLElement, UIComponent>();

    private root: HTMLElement | null = null;

    private readonly children: UIComponent[] = [];
    private readonly enhancers: UIEnhancer[] = [];

    private parent: UIComponent | null = null;
    private disposed = false;

    protected wasDrawn = false;

    public constructor(private readonly element: HTMLElement) {
        UIComponent.elementRegistry.set(element, this);

        if (element.parentElement !== null) {
            this.root = element.parentElement;
        }
    }

    public static fromElement(element: HTMLElement): UIComponent | undefined {
        return this.elementRegistry.get(element);
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

    public getChild<T extends UIComponent>(type: Class<T>): T | null;

    public getChild<T extends UIComponent>(type: Class<T>, filter: (el: T) => boolean): T | null;

    public getChild<T extends UIComponent>(type: Class<T>, filter?: (el: T) => boolean): T | null {
        if (!filter) filter = () => true;

        for (const child of this.children) {
            if (child instanceof type && filter(child)) {
                return child;
            } else {
                const result = child.getChild(type, filter);
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

    addChildBefore(child: UIComponent, before: HTMLElement): void {
        this.children.push(child);

        child.root = this.element;
        this.element.insertBefore(child.getUnderlyingElement(), before);
        child.mount(this);
    }

    public dispose(): void {
        if (this.disposed) {
            return;
        }
        this.disposed = true;

        for (const child of [...this.children]) {
            child.dispose();
        }
        this.children.length = 0;

        if (this.parent !== null) {
            this.parent.detachChild(this);
        }

        const element = this.getUnderlyingElement();
        if (element.parentElement !== null) {
            element.parentElement.removeChild(element);
        }

        this.parent = null;
        this.root = null;

        UIHooks.clearOwner(this);
    }

    public clearChildren(): void {
        for (const child of [...this.children]) {
            child.dispose();
        }
    }

    public isDisposed(): boolean {
        return this.disposed;
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

    protected addEnhancer(enhancer: Constructor<UIEnhancer>): void {
        this.enhancers.push(new enhancer(this));
    }

    protected getUnderlyingElement(): HTMLElement {
        return this.element;
    }

    protected addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void {
        this.getUnderlyingElement().addEventListener(type, listener, options);
    }

    protected mount(parent: UIComponent) {
        this.disposed = false;
        if (!this.root) {
            this.root = parent.getUnderlyingElement();
            this.root.appendChild(this.getUnderlyingElement());
        }
        this.parent = parent;
    }

    protected drawChildren(): void {
        for (const child of this.children) {
            child.draw();
            child.wasDrawn = true;
        }
    }

    protected redraw(): void {
        if (this.wasDrawn) { // Only redraw if it was drawn at least once before
            this.draw();
        }
    }

    protected setInnerHTML(html: string): void {
        this.clearChildren();
        this.getUnderlyingElement().innerHTML = html;
    }

    protected addHtmlElement(element: HTMLElement): void {
        this.getUnderlyingElement().appendChild(element);
    }

    private detachChild(child: UIComponent): void {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
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
