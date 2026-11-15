import {ValuedComponent} from "../../engine/mixins/ValuedComponent";
import {HTMLUtils} from "../../../utils/HTMLUtils";
import {IdeControlElement} from "../elements/IdeControlElement";
import {CustomElementsRegistry} from "../CustomElementsRegistry";
import {PopupMenu} from "../menu/impl/PopupMenu";
import {UIMenuAction} from "../menu/elements/UIMenuAction";
import {FaIcon} from "../../icons/FaIcon";

export type IdeDropdownItem = {
    value: string,
    /** Defaults to the value */
    label?: string,
    /** Name of a font awesome icon, shown in the list */
    icon?: string | null,
    disabled?: boolean
}

const SHADOW_STYLE = `
    .label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .arrow {
        flex: none;
        width: 5px;
        height: 5px;
        margin: 0 2px 3px 0;
        border: solid currentColor;
        border-width: 0 1.5px 1.5px 0;
        opacity: 0.7;
        transform: rotate(45deg);
    }
`;

/**
 * {@code <ide-dropdown value="b" placeholder="Pick one" disabled name="...">}: a dropdown choosing one of its
 * {@code <ide-option value="b" icon="file" disabled>Label</ide-option>} children, as a {@code <select>} does with
 * its {@code <option>}s.
 * <p>
 * The element itself is the field showing the selected option (drawn in its shadow root, so that its children only
 * hold the options), and opens a {@link PopupMenu} listing them. Options without value use their text.
 * The {@code value} attribute follows the selection; {@code input} and {@code change} are dispatched when the user
 * picks another option, by the list or by the arrow keys.
 */
class _CustomIdeDropdown extends IdeControlElement {
    private readonly labelElement: HTMLElement;
    private readonly observer = new MutationObserver(() => this.render());
    private menu: PopupMenu | null = null;

    constructor() {
        super("combobox");
        this.setAttribute("aria-haspopup", "listbox");
        this.setAttribute("aria-expanded", "false");

        const shadow = this.attachShadow({mode: "open"});
        shadow.appendChild(document.createElement("style")).textContent = SHADOW_STYLE;
        this.labelElement = HTMLUtils.createElement("span.label", shadow as unknown as HTMLElement);
        HTMLUtils.createElement("span.arrow", shadow as unknown as HTMLElement).setAttribute("part", "arrow");

        this.addEventListener("click", () => this.toggle());
        this.addEventListener("keydown", e => this.onKeydown(e));
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "value", "placeholder"];
    }

    /** The value of the selected option, "" when none is */
    get value(): string {
        return this.getAttribute("value") ?? (this.hasAttribute("placeholder") ? "" : this.optionValue(this.options[0]));
    }

    set value(value: string) {
        this.setAttribute("value", value);
    }

    get options(): HTMLElement[] {
        return [...this.querySelectorAll<HTMLElement>(":scope > ide-option")];
    }

    get selectedOption(): HTMLElement | null {
        const value = this.value;
        return this.options.find(option => this.optionValue(option) === value) ?? null;
    }

    get selectedIndex(): number {
        const selected = this.selectedOption;
        return selected ? this.options.indexOf(selected) : -1;
    }

    isOpen(): boolean {
        return this.menu?.isOpen() ?? false;
    }

    open(): void {
        if (this.disabled || this.isOpen()) return;

        const menu = new PopupMenu(this, {placement: "bottom-start", className: "ide-dropdown-menu", autoFocus: false});
        const selected = this.selectedOption;
        const options = this.options.filter(option => !option.hasAttribute("disabled"));
        const withIcons = options.some(option => option.hasAttribute("icon"));
        let selectedAction: HTMLElement | null = null;
        const actions: { element: HTMLElement, hasIcon: boolean }[] = [];

        for (const option of options) {
            const icon = option.getAttribute("icon");
            const value = this.optionValue(option);
            const action = new UIMenuAction(this.optionLabel(option), icon ? FaIcon.auto(icon) : null, () => this.selectByUser(value));
            menu.addMenuElement(action);

            actions.push({element: action.getUnderlyingElement(), hasIcon: icon !== null});
            if (option === selected) selectedAction = action.getUnderlyingElement();
        }

        menu.getElement().style.minWidth = HTMLUtils.px(this.offsetWidth);
        menu.onClose(() => {
            if (this.menu === menu) this.menu = null;
            this.setAttribute("aria-expanded", "false");
        });

        this.menu = menu;
        menu.open();
        if (!menu.isOpen()) {
            this.menu = null;
            return;
        }
        this.setAttribute("aria-expanded", "true");

        // The actions are drawn once the menu opens. Every row gets a check column, and an icon column when any option
        // has an icon, so that the labels line up
        for (const {element, hasIcon} of actions) {
            const check = HTMLUtils.createElement("span.ide-dropdown-check");
            if (element === selectedAction) check.appendChild(FaIcon.solid("fa-check").toHTML());
            element.prepend(check);

            if (withIcons && !hasIcon) check.after(HTMLUtils.createElement("span.ide-dropdown-icon-placeholder"));
        }

        if (selectedAction) {
            selectedAction.classList.add("selected");
            selectedAction.focus();
        } else {
            menu.getElement().querySelector<HTMLElement>(".ui-menu-action")?.focus();
        }
    }

    close(): void {
        this.menu?.close();
    }

    toggle(): void {
        if (this.isOpen()) this.close();
        else this.open();
    }

    connectedCallback() {
        super.connectedCallback();
        this.observer.observe(this, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["value", "disabled"]
        });
        this.render();
    }

    disconnectedCallback() {
        this.observer.disconnect();
        this.close();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name === "disabled" && newValue !== null) this.close();
        this.render();
    }

    private onKeydown(e: KeyboardEvent) {
        if (this.disabled) return;

        if (e.key === "Enter" || e.key === " " || (e.key === "ArrowDown" && e.altKey)) {
            this.open();
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
            // Changes the selection without opening the list, as a native select does
            const options = this.options.filter(option => !option.hasAttribute("disabled"));
            const index = options.indexOf(this.selectedOption!);
            const next = e.key === "Home" ? 0
                : e.key === "End" ? options.length - 1
                    : Math.max(0, Math.min(options.length - 1, index + (e.key === "ArrowDown" ? 1 : -1)));
            if (options[next]) this.selectByUser(this.optionValue(options[next]));
        } else {
            return;
        }
        e.preventDefault();
    }

    private selectByUser(value: string) {
        this.focus();
        if (value === this.value) return;

        this.value = value;
        this.dispatchEvent(new Event("input", {bubbles: true}));
        this.dispatchEvent(new Event("change", {bubbles: true}));
    }

    private render() {
        const selected = this.selectedOption;
        const placeholder = selected === null;

        this.labelElement.textContent = selected ? this.optionLabel(selected) : this.getAttribute("placeholder") ?? "";
        this.labelElement.setAttribute("part", placeholder ? "label placeholder" : "label");
        this.internals.setFormValue(selected ? this.optionValue(selected) : null);
    }

    private optionValue(option: HTMLElement | undefined): string {
        if (!option) return "";
        return option.getAttribute("value") ?? this.optionLabel(option);
    }

    private optionLabel(option: HTMLElement): string {
        return option.textContent?.trim() ?? "";
    }
}

CustomElementsRegistry.register("ide-dropdown", _CustomIdeDropdown);

/**
 * A dropdown choosing one of the given items, see {@code <ide-dropdown>}. Its value changes when the user picks
 * another item.
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export class IdeDropdown extends ValuedComponent<string> {

    constructor(parent: HTMLElement | null, private items: IdeDropdownItem[] = [], value: string | null = null) {
        super(HTMLUtils.createElement("ide-dropdown", parent ?? undefined));
        if (value !== null) this.dropdown().value = value;

        this.addEventListener("change", () => this.triggerValueChanged());
    }

    getValue(): string | null {
        return this.dropdown().selectedOption ? this.dropdown().value : null;
    }

    setValue(value: string): void {
        this.dropdown().value = value;
    }

    setItems(items: IdeDropdownItem[]): void {
        this.items = items;
        this.redraw();
    }

    /** Shown while no item is selected */
    setPlaceholder(placeholder: string | null): void {
        if (placeholder === null) this.dropdown().removeAttribute("placeholder");
        else this.dropdown().setAttribute("placeholder", placeholder);
    }

    setEnabled(enabled: boolean): void {
        this.dropdown().disabled = !enabled;
    }

    focus(): void {
        this.dropdown().focus();
    }

    public draw(): void {
        this.dropdown().replaceChildren(...this.items.map(item => {
            const option = document.createElement("ide-option");
            option.setAttribute("value", item.value);
            option.textContent = item.label ?? item.value;
            if (item.icon) option.setAttribute("icon", item.icon);
            if (item.disabled) option.setAttribute("disabled", "");
            return option;
        }));
    }

    private dropdown(): _CustomIdeDropdown {
        return this.getUnderlyingElement() as _CustomIdeDropdown;
    }
}
