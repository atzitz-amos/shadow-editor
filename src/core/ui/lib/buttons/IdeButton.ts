import {CustomElementsRegistry} from "../CustomElementsRegistry";
import {UIComponent} from "../../engine/components/UIComponent";
import {UIVariant} from "../theme/UIVariant";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";

export class IdeButton extends UIComponent {
    constructor(private msg: string, private readonly variant: UIVariant = UIVariant.PRIMARY) {
        super(HTMLUtils.createElement("button.ide-btn"));
    }

    disable() {
        this.getUnderlyingElement().setAttribute("disabled", "");
    }

    enable() {
        this.getUnderlyingElement().removeAttribute("disabled");
    }

    getClassList() {
        return this.getUnderlyingElement().classList;
    }

    onClick(handler: (event: MouseEvent) => void) {
        this.addEventListener("click", handler);
    }

    setText(msg: string) {
        this.msg = msg;
        this.redraw();
    }

    public draw(): void {
        this.setInnerHTML(this.msg);

        this.getUnderlyingElement().setAttribute(this.variant, "");
    }
}

class _CustomIdeButton extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['disabled'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        // Sync the disabled attribute down to the internal native button element
        const btn = this.querySelector('button');
        if (btn) {
            if (newValue !== null) btn.setAttribute(name, '');
            else btn.removeAttribute(name);
        }
    }

    render() {
        const disabled = this.hasAttribute('disabled') ? "disabled " : "";
        const primary = this.hasAttribute('primary') ? "primary " : "";
        const secondary = this.hasAttribute('secondary') ? "secondary " : "";
        const ghost = this.hasAttribute('ghost') ? "ghost" : "";

        const existingContent = this.innerHTML;

        this.innerHTML = `
            <button class="ide-btn" ${disabled + primary + secondary + ghost}>
                ${existingContent}
            </button>
        `;

        this.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                this.click();
            }
        })
    }

    focus(options?: FocusOptions) {
        (<HTMLElement>this.querySelector(".ide-btn")).focus(options);
    }
}

CustomElementsRegistry.register("ide-button", _CustomIdeButton);
