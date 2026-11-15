import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../core/utils/HTMLUtils";

/**
 * Thin bar on the bottom border of the toolbar showing the progress of a run. It appears at once when the run starts,
 * follows its progress, and once the run is over stays complete a moment before fading out.
 *
 * @author Atzitz Amos
 * @date 10/24/2026
 * @since 1.0.0
 */
export class SynSuiteProgressBar extends UIComponent {
    /** How long the completed bar stays visible once the run is over, in milliseconds */
    private static readonly HOLD_DURATION = 400;
    /** Smallest width shown, so that the bar is visible as soon as a run starts */
    private static readonly MIN_PROGRESS = 0.02;

    private readonly fill: HTMLElement;
    private running: boolean = false;
    private hideTimer: number | null = null;

    constructor() {
        super(HTMLUtils.createDiv("syn-suite-progress"));
        this.fill = HTMLUtils.createDiv("syn-suite-progress-fill", this.getUnderlyingElement());
    }

    draw(): void {
    }

    /**
     * @param progress how much of the run is done, between 0 and 1, or null when no run is in progress
     */
    setProgress(progress: number | null): void {
        if (progress !== null) {
            this.cancelHide();
            this.running = true;
            this.getUnderlyingElement().classList.add("visible");
            this.setWidth(Math.max(progress, SynSuiteProgressBar.MIN_PROGRESS));
            return;
        }

        if (!this.running) return;
        this.running = false;
        this.setWidth(1);
        this.hideTimer = window.setTimeout(() => {
            this.hideTimer = null;
            this.getUnderlyingElement().classList.remove("visible");
        }, SynSuiteProgressBar.HOLD_DURATION);
    }

    dispose(): void {
        this.cancelHide();
        super.dispose();
    }

    private setWidth(progress: number) {
        this.fill.style.width = `${progress * 100}%`;
    }

    private cancelHide() {
        if (this.hideTimer !== null) clearTimeout(this.hideTimer);
        this.hideTimer = null;
    }
}
