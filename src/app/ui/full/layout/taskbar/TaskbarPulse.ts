import {HtmlComponent} from "../../../../../core/ui/engine/components/HtmlComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export class TaskbarPulse extends HtmlComponent {
    private readonly pulseDot: HTMLElement;
    private readonly pulseText: HTMLElement;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("topbar-pulse", root));

        this.pulseDot = HTMLUtils.createDiv("pulse-dot", this.getUnderlyingElement());
        this.pulseText = HTMLUtils.createDiv("pulse-text", this.getUnderlyingElement());
        this.pulseText.textContent = "Focused · 0m";
    }

    draw(): void {

    }

}
