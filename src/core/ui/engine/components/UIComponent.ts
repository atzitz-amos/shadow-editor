import {CommonKeyImpl, getCommonKeyValue, hasCommonKey} from "../../../utils/CommonKey";
import {UIHooks} from "../listeners/hooks/UIHooks";
import {Drawable} from "../../api/Drawable";
import {Disposable} from "../../api/Disposable";


export abstract class UIComponent implements Drawable, Disposable {
    private static readonly elementRegistry = new WeakMap<HTMLElement, UIComponent>();
    protected wasDrawn = false;
    private root: HTMLElement | null = null;
    private parent: UIComponent | null = null;
    private readonly children: UIComponent[] = [];
    private disposed = false;

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

    public queryChildSelector(selector: string): UIComponent | null {
        if (this.getUnderlyingElement().querySelector(selector) !== null) {
            return this;
        }
        for (const child of this.children) {
            if (child.queryChildSelector(selector)) {
                return child;
            }
        }
        return null;
    }

    public addChild(child: UIComponent): void {
        this.children.push(child);
        child.mount(this);
    }

    public addChildTo(child: UIComponent, parent: HTMLElement): void {
        this.children.push(child);

        child.root = parent;
        parent.appendChild(child.getUnderlyingElement());
        child.mount(this);
    }

    public removeChild(child: UIComponent): void {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.dispose();
        }
    }

    public addChildBefore(child: UIComponent, before: HTMLElement): void {
        this.children.push(child);

        child.root = this.element;
        this.element.insertBefore(child.getUnderlyingElement(), before);
        child.mount(this);
    }

    public addChildAfter(child: UIComponent, after: HTMLElement): void {
        const next = after.nextElementSibling;
        if (next instanceof HTMLElement) return this.addChildBefore(child, next);
        return this.addChild(child);
    }

    public getBBox(): DOMRect {
        return this.getUnderlyingElement().getBoundingClientRect();
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

    public getUnderlyingElement(): HTMLElement {
        return this.element;
    }

    public hasFocus() {
        return document.activeElement === this.getUnderlyingElement() || this.getUnderlyingElement().contains(document.activeElement);
    }

    public redraw(): void {
        if (this.wasDrawn) { // Only redraw if it was drawn at least once before
            this.draw();
        }
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

    protected setInnerHTML(html: string): void {
        this.clearChildren();
        this.getUnderlyingElement().innerHTML = html;
    }

    protected addHtmlElement(element: HTMLElement): void {
        this.getUnderlyingElement().appendChild(element);
    }

    protected insertHTML(html: string): void {
        this.getUnderlyingElement().innerHTML += html;
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


type UnionToIntersection<U> =
    (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type InstanceIntersection<T extends Class[]> =
    UnionToIntersection<InstanceType<T[number]>>;

type UIComponentClass = abstract new (element: HTMLElement) => UIComponent;

type UIComponentConstructor<T> = abstract new (element: HTMLElement) => T;

export function UIComponentMixin<T extends UIComponentClass[]>(
    ...mixins: T
): UIComponentConstructor<UIComponent & InstanceIntersection<T>> {
    abstract class Merged extends UIComponent {
        constructor(element: HTMLElement) {
            super(element);

            for (const mixin of mixins) {
                if ("_initMixin" in mixin.prototype && typeof mixin.prototype._initMixin === "function") {
                    mixin.prototype._initMixin.call(this);
                }
            }
        }
    }

    for (const Ctor of mixins) {
        let proto = Ctor.prototype;

        while (proto && proto !== UIComponent.prototype) {
            for (const name of Object.getOwnPropertyNames(proto)) {
                if (name === "constructor") continue;
                if (name in Merged.prototype) continue; // first mixin listed wins on conflicts... see note below
                Object.defineProperty(Merged.prototype, name,
                    Object.getOwnPropertyDescriptor(proto, name)!);
            }
            proto = Object.getPrototypeOf(proto);
        }
    }

    const originalDraw = Merged.prototype.draw;

    Merged.prototype.draw = function () {
        for (const mixin of mixins) {
            if ("_drawMixin" in mixin.prototype && typeof mixin.prototype._drawMixin === "function") {
                mixin.prototype._drawMixin.call(this);
            }
            originalDraw.call(this);
        }
    }

    return Merged as unknown as UIComponentConstructor<UIComponent & InstanceIntersection<T>>;
}
