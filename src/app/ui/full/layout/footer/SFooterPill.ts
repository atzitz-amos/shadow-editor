import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 3/4/2026
 * @since 1.0.0
 */
export class SFooterPill extends UIComponent {
    private readonly text: string;
    private readonly icon: string | null = null;

    constructor(root: HTMLElement, text: string, icon: string | null = null, style: string | null = null) {
        super(HTMLUtils.createElement("span.footer-pill", root));
        this.text = text;
        this.icon = icon;

        if (style != null) this.getUnderlyingElement().classList.add(style);
    }

    draw(): void {
        if (this.icon) {
            this.getUnderlyingElement().innerHTML = `<i class="${this.icon}"></i> ${this.text}`;
        } else {
            this.getUnderlyingElement().textContent = this.text;
        }
    }
}
