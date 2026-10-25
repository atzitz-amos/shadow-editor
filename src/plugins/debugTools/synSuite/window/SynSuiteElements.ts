/**
 * Small elements shared by the views of the SynSuite window.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteElements {
    /**
     * A secondary {@code <ide-button>} with an icon. The element renders itself once attached, so it is fully
     * configured before being appended.
     */
    static button(parent: HTMLElement, label: string, icon: string, enabled: boolean, onClick: () => void, tooltip?: string): HTMLElement {
        const button = document.createElement("ide-button");
        button.setAttribute("secondary", "");
        if (!enabled) button.setAttribute("disabled", "");
        if (tooltip) button.title = tooltip;
        button.appendChild(document.createElement("i")).className = icon;
        button.append(label);
        button.addEventListener("click", () => enabled && onClick());

        parent.appendChild(button);
        return button;
    }

    /** A borderless icon button turning red on hover, for destructive actions */
    static dangerIconButton(parent: HTMLElement, icon: string, tooltip: string, enabled: boolean, onClick: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        button.className = "syn-suite-icon-action";
        button.type = "button";
        button.title = tooltip;
        button.disabled = !enabled;
        button.appendChild(document.createElement("i")).className = icon;
        button.addEventListener("click", onClick);

        parent.appendChild(button);
        return button;
    }

    /** An icon followed by a text, as in the meta line of a test */
    static metaItem(parent: HTMLElement, icon: string, text: string): HTMLElement {
        const item = document.createElement("span");
        item.className = "syn-suite-meta-item";
        item.appendChild(document.createElement("i")).className = icon;
        item.append(text);

        parent.appendChild(item);
        return item;
    }
}
