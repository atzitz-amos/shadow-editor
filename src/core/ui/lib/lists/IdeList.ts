import {UIComponent, UIComponentMixin} from "../../engine/components/UIComponent";
import {Focusable} from "../../engine/mixins/Focusable";
import {ValuedComponent} from "../../engine/mixins/ValuedComponent";
import {HTMLUtils} from "../../../utils/HTMLUtils";

/**
 * A vertical list of elements, each shown by a component, one of which is selected.
 * <p>
 * The selection moves with the arrow keys, wrapping around at both ends, or by clicking an item. The selected
 * element is confirmed with Enter or a double click. The value of the list is the selected element.
 *
 * @param T the type of the listed elements
 * @param I the type of the components showing them
 *
 * @author Atzitz Amos
 * @date 11/14/2026
 * @since 1.0.0
 */
export class IdeList<T, I extends UIComponent = UIComponent> extends UIComponentMixin(Focusable, ValuedComponent<unknown>) {
    private elements: T[] = [];
    private items: I[] = [];
    private selectedIndex: number = 0;
    private focusOnClick: boolean = true;

    private readonly emptyPlaceholder: HTMLElement = HTMLUtils.createDiv("ide-list-empty");

    /**
     * @param parent the element the list is appended to
     * @param elements the listed elements, in order
     * @param toComponent creates the component showing an element. Called once per element: the component is
     * reused for as long as the element stays listed, and disposed when it no longer is
     * @param className added to the `ide-list` class of the list
     */
    constructor(parent: HTMLElement,
                elements: T[],
                private readonly toComponent: (element: T) => I,
                className: string = "") {
        super(HTMLUtils.createDiv(("ide-list " + className).trim(), parent));

        this.emptyPlaceholder.textContent = "No results";

        this.addEventListener("click", e => {
            if (this.focusOnClick) this.focus();
            e.stopPropagation();
        });

        this.addEventListener("keydown", e => {
            this.onKeyDown(e);
        });

        this.replaceElements(elements);
    }

    /**
     * Handles a key of the list. Public so that the keys can be forwarded by something else that keeps the focus.
     */
    onKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            this.select(this.selectedIndex - 1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            this.select(this.selectedIndex + 1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (this.selectedIndex < this.elements.length) this.triggerValueConfirmed();
        }
    }

    getElements(): T[] {
        return this.elements;
    }

    getSelectedIndex(): number {
        return this.selectedIndex;
    }

    /** The component showing the selected element */
    getSelectedItem(): I | null {
        return this.items[this.selectedIndex] ?? null;
    }

    /** The selected element */
    getValue(): T | null {
        return this.selectedIndex < this.elements.length ? this.elements[this.selectedIndex] : null;
    }

    public setOnValueChanged(callback: (value: T | null) => void): void {
        super.setOnValueChanged(callback as (value: unknown) => void);
    }

    public setOnValueConfirmed(callback: (value: T | null) => void): void {
        super.setOnValueConfirmed(callback as (value: unknown) => void);
    }

    /**
     * Selects the element at `index`, wrapping around: the one before the first is the last, and the one after
     * the last is the first.
     */
    select(index: number): void {
        const count = this.elements.length;
        this.selectedIndex = count === 0 ? 0 : ((index % count) + count) % count;
        this.updateSelected();
    }

    /**
     * Whether clicking the list gives it the keyboard focus, which is the default. Disable it for a list whose
     * keys are forwarded by something else that must keep the focus.
     */
    setFocusOnClick(focusOnClick: boolean): void {
        this.focusOnClick = focusOnClick;
    }

    /**
     * Replaces the listed elements. The selected element stays selected if it is still listed, otherwise the
     * first one is.
     */
    setElements(elements: T[]): void {
        const selected = this.getValue();

        this.replaceElements(elements);
        this.selectedIndex = Math.max(0, selected === null ? 0 : this.elements.indexOf(selected));

        this.draw();
    }

    public draw(): void {
        const element = this.getUnderlyingElement();

        if (this.items.length === 0) {
            element.appendChild(this.emptyPlaceholder);
        } else {
            this.emptyPlaceholder.remove();
            // Appending an element that is already there moves it: this puts the items in order
            for (const item of this.items) element.appendChild(item.getUnderlyingElement());
        }

        this.drawChildren();
        this.updateSelected();
    }

    private replaceElements(elements: T[]): void {
        // The components of the elements that stay are reused. An element listed twice gets two components.
        const reusable = new Map<T, I[]>();
        this.elements.forEach((element, index) => {
            const components = reusable.get(element);
            if (components) components.push(this.items[index]);
            else reusable.set(element, [this.items[index]]);
        });

        const items = elements.map(element => reusable.get(element)?.shift() ?? this.createItem(element));

        for (const components of reusable.values()) {
            for (const item of components) this.removeChild(item);
        }

        this.elements = [...elements];
        this.items = items;
    }

    private createItem(element: T): I {
        const item = this.toComponent(element);
        this.addChild(item);

        const html = item.getUnderlyingElement();
        html.addEventListener("click", () => {
            const index = this.items.indexOf(item);
            if (index !== -1) this.select(index);
        });

        html.addEventListener("dblclick", e => {
            const index = this.items.indexOf(item);
            if (index === -1) return;

            this.select(index);
            this.triggerValueConfirmed();
            e.stopPropagation();
        });

        return item;
    }

    private updateSelected() {
        this.items.forEach((item, index) => {
            const element = item.getUnderlyingElement();
            if (index === this.selectedIndex) {
                element.classList.add("selected");
                element.scrollIntoView({block: "nearest"});
            } else {
                element.classList.remove("selected");
            }
        });

        this.triggerValueChanged()
    }
}
