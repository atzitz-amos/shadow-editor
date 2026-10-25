import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {SynSuiteWindowContext} from "./SynSuiteWindowContext";
import {SynSuiteStatus} from "./SynSuiteStatus";

/**
 * Bottom bar: size of the suite and outcome of the last run.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteStatusBar extends UIComponent {
    private static readonly NOTE_DURATION = 8000;

    private readonly left: HTMLElement;
    private readonly right: HTMLElement;
    private note: string | null = null;

    constructor(private readonly context: SynSuiteWindowContext) {
        super(HTMLUtils.createDiv("syn-suite-statusbar"));
        this.left = HTMLUtils.createElement("span", this.getUnderlyingElement());
        this.right = HTMLUtils.createElement("span", this.getUnderlyingElement());
    }

    /** Shows a message in place of the size of the suite for a few seconds */
    showNote(note: string): void {
        this.note = note;
        this.draw();
        setTimeout(() => {
            if (this.note !== note) return;
            this.note = null;
            this.draw();
        }, SynSuiteStatusBar.NOTE_DURATION);
    }

    draw(): void {
        const tests = this.context.store.getAll().length;
        const groups = this.context.store.getGroups().length;
        this.left.textContent = this.note ?? `${tests} test${tests === 1 ? "" : "s"} · ${groups} group${groups === 1 ? "" : "s"}`;

        const runner = this.context.runner;
        const lastRun = runner.getLastRun();
        if (runner.isRunning()) {
            this.right.textContent = `Running… ${Math.round(runner.getProgress() * 100)}%`;
        } else if (lastRun) {
            const time = new Date(lastRun.finishedAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
            this.right.textContent = `Last run ${time} · ${lastRun.count} test${lastRun.count === 1 ? "" : "s"} in ${SynSuiteStatus.duration(lastRun.duration)}`;
        } else {
            this.right.textContent = "Not run yet";
        }
    }
}
