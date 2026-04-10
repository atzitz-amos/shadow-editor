import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export class TaskbarPulse extends UIComponent {
    private readonly pulseDot: HTMLElement;
    private readonly pulseText: HTMLElement;

    private time: number = 0;
    private timeout: NodeJS.Timeout;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("topbar-pulse", root));

        this.pulseDot = HTMLUtils.createDiv("pulse-dot", this.getUnderlyingElement());
        this.pulseText = HTMLUtils.createDiv("pulse-text", this.getUnderlyingElement());
        this.pulseText.innerHTML = "Focused · 0s";

        this.timeout = setInterval(() => {
            this.time += 1;
            if (this.time < 60) this.pulseText.innerHTML = `Focused · ${this.time}s`;
            else if (this.time < 3600) this.pulseText.innerHTML = `Focused · ${Math.floor(this.time / 60)}m`;
            else this.pulseText.innerHTML = `Focused · ${Math.floor(this.time / 3600)}h${Math.floor((this.time % 3600) / 60)}m`;

        }, 1000);
    }

    dispose() {
        super.dispose();

        clearInterval(this.timeout);
    }

    draw(): void {

    }

}
