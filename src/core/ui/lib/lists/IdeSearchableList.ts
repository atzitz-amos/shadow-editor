import {Describable} from "../../api/Describable";
import {UIComponentElement} from "../elements/UIComponentElement";
import {CustomElementsRegistry} from "../CustomElementsRegistry";
import {FaIcon} from "../../icons/FaIcon";
import {IdeList} from "./IdeList";
import {IdeIconListItem} from "./IdeIconListItem";

/**
 * An {@link IdeList} of {@link Describable}s, each shown as an {@link IdeIconListItem} and sorted by description.
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export class IdeSearchableList<T extends Describable> extends IdeList<T, IdeIconListItem<T>> {
    constructor(parent: HTMLElement, elements: T[]) {
        super(parent, IdeSearchableList.sorted(elements), element => new IdeIconListItem(element), "ide-searchable-list");
    }

    private static sorted<T extends Describable>(elements: T[]): T[] {
        return elements.toSorted((a, b) => a.getDescription().localeCompare(b.getDescription()));
    }

    setElements(elements: T[]): void {
        super.setElements(IdeSearchableList.sorted(elements));
    }
}

/** An item of an {@code <ide-searchable-list>} described by an {@code <ide-list-item>} child */
export type IdeListItemElementDescription = Describable & { element: HTMLElement };

/**
 * {@code <ide-searchable-list>}: an {@link IdeSearchableList} of the {@code items} property, or else of its
 * {@code <ide-list-item icon="file">Label</ide-list-item>} children.
 * <p>
 * Dispatches a {@code change} event when the selected item changes, and a {@code confirm} event when it is chosen
 * (Enter or double click), both with the item as {@code detail.value}.
 */
class _CustomIdeSearchableList extends UIComponentElement<IdeSearchableList<Describable>> {
    private explicitItems: Describable[] | null = null;
    private readonly observer = new MutationObserver(records => {
        const itemsChanged = records.some(record => record.type === "attributes" || record.type === "characterData"
            || [...record.addedNodes, ...record.removedNodes].some(node => node.nodeName === "IDE-LIST-ITEM"));
        if (itemsChanged && this.explicitItems === null) this.scheduleRebuild();
    });

    get items(): Describable[] {
        return this.explicitItems ?? this.itemsFromChildren();
    }

    /** Overrides the {@code <ide-list-item>} children, null uses them again */
    set items(items: Describable[] | null) {
        this.explicitItems = items;
        this.scheduleRebuild();
    }

    /** The selected item */
    get value(): Describable | null {
        return this.getComponent()?.getValue() ?? null;
    }

    focus(options?: FocusOptions) {
        const list = this.getComponent();
        if (list) list.focus();
        else super.focus(options);
    }

    connectedCallback() {
        super.connectedCallback();
        this.observer.observe(this, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["icon"]
        });
    }

    disconnectedCallback() {
        this.observer.disconnect();
    }

    protected createComponent(): IdeSearchableList<Describable> {
        const list = new IdeSearchableList(this, this.items);
        list.setOnValueChanged(value => this.dispatchEvent(new CustomEvent("change", {detail: {value}})));
        list.setOnValueConfirmed(value => this.dispatchEvent(new CustomEvent("confirm", {detail: {value}})));
        return list;
    }

    private itemsFromChildren(): IdeListItemElementDescription[] {
        return [...this.querySelectorAll<HTMLElement>(":scope > ide-list-item")].map(element => ({
            element,
            getDescription: () => element.textContent?.trim() ?? "",
            getIcon: () => {
                const icon = element.getAttribute("icon");
                return icon ? FaIcon.auto(icon) : null;
            }
        }));
    }
}

CustomElementsRegistry.register("ide-searchable-list", _CustomIdeSearchableList);
