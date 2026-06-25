import {CustomElementsRegistry} from "../CustomElementsRegistry";

class IdeButton extends HTMLElement {
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
            if (name === 'disabled') {
                if (newValue !== null) btn.setAttribute('disabled', '');
                else btn.removeAttribute('disabled');
            }
        }
    }

    render() {
        // Check initial state
        const isDisabled = this.hasAttribute('disabled');

        // Save existing text nodes/icons inside the tag
        const existingContent = this.innerHTML;

        // Structure the element markup
        this.innerHTML = `
            <button class="ide-btn" ${isDisabled ? 'disabled' : ''}>
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

CustomElementsRegistry.register("ide-button", IdeButton);
