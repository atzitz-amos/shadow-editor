import {ValuedComponent} from "../../engine/mixins/ValuedComponent";
import {HTMLUtils} from "../../../utils/HTMLUtils";
import {IdeControlElement} from "../elements/IdeControlElement";
import {CustomElementsRegistry} from "../CustomElementsRegistry";

/**
 * {@code <ide-checkbox checked indeterminate disabled name="..." value="...">Label</ide-checkbox>}: a checkbox whose
 * content is its label. The element itself is the checkbox (its box is drawn by css), so its content, style and
 * class list can be changed like those of any regular element.
 * <p>
 * As a native checkbox, it toggles on click and Space, then dispatches {@code input} and {@code change}, and submits
 * its {@code value} (defaults to "on") with its form when checked.
 */
class _CustomIdeCheckbox extends IdeControlElement {
    constructor() {
        super("checkbox");

        // Runs after the disabled check of IdeControlElement, and before the listeners of the user, which therefore
        // see the new state as with a native checkbox
        this.addEventListener("click", () => this.toggleByUser());

        this.addEventListener("keydown", e => {
            if (e.key === " ") {
                e.preventDefault();
                this.click();
            }
        });
    }

    static get observedAttributes() {
        return [...super.observedAttributes, "checked", "indeterminate", "value"];
    }

    get checked(): boolean {
        return this.hasAttribute("checked");
    }

    set checked(value: boolean) {
        this.toggleAttribute("checked", value);
    }

    /** Neither checked nor unchecked, such as a "select all" checkbox with only some items selected */
    get indeterminate(): boolean {
        return this.hasAttribute("indeterminate");
    }

    set indeterminate(value: boolean) {
        this.toggleAttribute("indeterminate", value);
    }

    get value(): string {
        return this.getAttribute("value") ?? "on";
    }

    set value(value: string) {
        this.setAttribute("value", value);
    }

    connectedCallback() {
        super.connectedCallback();
        this.sync();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        super.attributeChangedCallback(name, oldValue, newValue);
        this.sync();
    }

    private toggleByUser() {
        this.indeterminate = false;
        this.checked = !this.checked;

        this.dispatchEvent(new Event("input", {bubbles: true}));
        this.dispatchEvent(new Event("change", {bubbles: true}));
    }

    private sync() {
        this.setAttribute("aria-checked", this.indeterminate ? "mixed" : String(this.checked));
        this.internals.setFormValue(this.checked ? this.value : null);
    }
}

CustomElementsRegistry.register("ide-checkbox", _CustomIdeCheckbox);

/**
 * A checkbox with a label, see {@code <ide-checkbox>}. Its value changes when the user toggles it.
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export class IdeCheckbox extends ValuedComponent<boolean> {
    constructor(parent: HTMLElement | null, private label: string, checked: boolean = false) {
        super(HTMLUtils.createElement("ide-checkbox", parent ?? undefined));
        this.checkbox().checked = checked;

        this.addEventListener("change", () => this.triggerValueChanged());
    }

    getValue(): boolean {
        return this.checkbox().checked;
    }

    isChecked(): boolean {
        return this.checkbox().checked;
    }

    setChecked(checked: boolean): void {
        this.checkbox().indeterminate = false;
        this.checkbox().checked = checked;
    }

    setIndeterminate(indeterminate: boolean): void {
        this.checkbox().indeterminate = indeterminate;
    }

    setEnabled(enabled: boolean): void {
        this.checkbox().disabled = !enabled;
    }

    setLabel(label: string): void {
        this.label = label;
        this.redraw();
    }

    focus(): void {
        this.checkbox().focus();
    }

    public draw(): void {
        this.getUnderlyingElement().textContent = this.label;
    }

    private checkbox(): _CustomIdeCheckbox {
        return this.getUnderlyingElement() as _CustomIdeCheckbox;
    }
}
