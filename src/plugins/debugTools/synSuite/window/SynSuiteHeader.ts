import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {SynSuiteWindowContext} from "./SynSuiteWindowContext";
import {SynSuiteDisplayStatus, SynSuiteStatus} from "./SynSuiteStatus";
import {SynSuiteTestStatus} from "../../../../app/testLib/lang/suite/SynSuiteTestResult";

const SUMMARY_STATUSES: SynSuiteDisplayStatus[] = [
    SynSuiteTestStatus.PASSED, SynSuiteTestStatus.FAILED, SynSuiteTestStatus.ERROR, SynSuiteTestStatus.TIMED_OUT, "idle"
];

/**
 * Title bar of the window: the title, how many tests are in each status, and the close button.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteHeader extends UIComponent {
    private readonly summary: HTMLElement;

    constructor(private readonly context: SynSuiteWindowContext, onClose: () => void) {
        super(HTMLUtils.createDiv("syn-suite-header"));

        const root = this.getUnderlyingElement();
        HTMLUtils.createDiv("syn-suite-title", root).textContent = "SynSuite";
        this.summary = HTMLUtils.createDiv("syn-suite-summary", root);

        const close = HTMLUtils.createDiv("syn-suite-close", root);
        close.innerHTML = `<i class="fa fa-close"></i>`;
        close.title = "Close";
        close.addEventListener("click", onClose);
    }

    draw(): void {
        const counts = new Map<SynSuiteDisplayStatus, number>(SUMMARY_STATUSES.map(status => [status, 0]));
        for (const test of this.context.store.getAll()) {
            const status = this.context.statusOf(test);
            // Running and queued tests count as not run until they finish
            const key = counts.has(status) ? status : "idle";
            counts.set(key, counts.get(key)! + 1);
        }

        this.summary.innerHTML = "";
        for (const [status, count] of counts) {
            // Timeouts are rare: only shown when there are some
            if (status === SynSuiteTestStatus.TIMED_OUT && count === 0) continue;

            const item = HTMLUtils.createElement("span.syn-suite-summary-item", this.summary);
            item.classList.toggle("zero", count === 0);
            item.title = `${count} ${SynSuiteStatus.label(status).toLowerCase()}`;
            item.append(SynSuiteStatus.icon(status), String(count));
        }
    }
}
