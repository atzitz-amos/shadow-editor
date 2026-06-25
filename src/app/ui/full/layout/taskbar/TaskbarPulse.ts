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

    private readonly startTime: number;
    private readonly timeout: NodeJS.Timeout;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("topbar-pulse", root));

        this.pulseDot = HTMLUtils.createDiv("pulse-dot", this.getUnderlyingElement());
        this.pulseText = HTMLUtils.createDiv("pulse-text", this.getUnderlyingElement());
        this.pulseText.innerHTML = "Focused · 0s";

        // Store the exact unix timestamp when the component initialized
        this.startTime = Date.now();

        this.timeout = setInterval(() => {
            // Calculate elapsed time in seconds
            const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

            if (elapsedSeconds < 60) {
                this.pulseText.innerHTML = `Focused · ${elapsedSeconds}s`;
            } else if (elapsedSeconds < 3600) {
                this.pulseText.innerHTML = `Focused · ${Math.floor(elapsedSeconds / 60)}m`;
            } else {
                const hours = Math.floor(elapsedSeconds / 3600);
                const minutes = Math.floor((elapsedSeconds % 3600) / 60);
                this.pulseText.innerHTML = `Focused · ${hours}h${minutes}m`;
            }

        }, 1000);
    }

    dispose() {
        super.dispose();

        clearInterval(this.timeout);
    }

    draw(): void {

    }
}