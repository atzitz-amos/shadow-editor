import {UIComponent} from "../../engine/components/UIComponent";

/**
 * Base of the custom elements hosting a {@link UIComponent}.
 * <p>
 * The component is created from the attributes of the element once it is connected, and created again whenever one
 * of its observed attributes changes. It lives as a child of the element, which can therefore be styled, sized and
 * moved like any other element.
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export abstract class UIComponentElement<T extends UIComponent> extends HTMLElement {
    private component: T | null = null;
    private rebuildScheduled = false;

    /** The hosted component, null until the element is first connected */
    getComponent(): T | null {
        return this.component;
    }

    connectedCallback() {
        if (this.component === null) this.rebuild();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (oldValue !== newValue) this.scheduleRebuild();
    }

    protected abstract createComponent(): T;

    /** Creates the component again at the next microtask, so that changing several attributes rebuilds it once */
    protected scheduleRebuild() {
        if (this.rebuildScheduled || this.component === null) return;
        this.rebuildScheduled = true;

        queueMicrotask(() => {
            this.rebuildScheduled = false;
            this.rebuild();
        });
    }

    protected rebuild() {
        this.component?.dispose();

        const component = this.createComponent();
        this.component = component;
        this.appendChild(component.getUnderlyingElement());
        component.drawAsRoot();
    }

    protected stringAttribute(name: string): string | undefined {
        return this.getAttribute(name) ?? undefined;
    }

    protected numberAttribute(name: string): number | undefined {
        const value = this.getAttribute(name);
        if (value === null || value.trim() === "") return undefined;

        const number = Number(value);
        return Number.isFinite(number) ? number : undefined;
    }

    /** A boolean attribute is true when present, unless its value is "false" */
    protected booleanAttribute(name: string): boolean | undefined {
        const value = this.getAttribute(name);
        if (value === null) return undefined;
        return value !== "false";
    }
}
