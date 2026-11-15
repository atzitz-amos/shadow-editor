/**
 * Base of the custom elements which are themselves a control, such as {@code <ide-button>} or {@code <ide-checkbox>}.
 * <p>
 * Handles what native controls do on their own: being focusable unless disabled, ignoring clicks while disabled, and
 * taking part in forms. Being form-associated makes the {@code disabled} attribute match {@code :disabled}, and lets
 * subclasses submit a value through {@link internals}.
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export abstract class IdeControlElement extends HTMLElement {
    static formAssociated = true;

    protected readonly internals: ElementInternals;

    protected constructor(private readonly ariaRole: string) {
        super();
        this.internals = this.attachInternals();

        // Registered first, so it runs before any listener added by the user
        this.addEventListener("click", e => {
            if (this.disabled) e.stopImmediatePropagation();
        });
    }

    static get observedAttributes(): string[] {
        return ["disabled"];
    }

    get disabled(): boolean {
        return this.hasAttribute("disabled");
    }

    set disabled(value: boolean) {
        this.toggleAttribute("disabled", value);
    }

    get form(): HTMLFormElement | null {
        return this.internals.form;
    }

    get name(): string | null {
        return this.getAttribute("name");
    }

    connectedCallback() {
        if (!this.hasAttribute("role")) this.setAttribute("role", this.ariaRole);
        this.syncFocusable();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        this.syncFocusable();
    }

    private syncFocusable() {
        if (!this.isConnected) return;

        if (this.disabled) {
            this.removeAttribute("tabindex");
            this.setAttribute("aria-disabled", "true");
        } else {
            if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
            this.removeAttribute("aria-disabled");
        }
    }
}
