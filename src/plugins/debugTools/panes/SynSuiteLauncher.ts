import {UIComponent} from "../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../core/utils/HTMLUtils";
import {GlobalState} from "../../../core/global/GlobalState";
import {IdeDialogUtilsCore} from "../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {SynSuiteEngine} from "../../../app/testLib/lang/suite/SynSuiteEngine";
import {SynSuiteGroups, SynSuiteTest} from "../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteTestStatus} from "../../../app/testLib/lang/suite/SynSuiteTestResult";
import {SynSuiteTestsChangedEvent} from "../../../app/testLib/lang/suite/events/SynSuiteTestsChangedEvent";
import {SynSuiteTestsRunEvent} from "../../../app/testLib/lang/suite/events/SynSuiteTestsRunEvent";
import {SynSuitePopup} from "../synSuite/SynSuitePopup";
import {SynSuiteDisplayStatus, SynSuiteStatus} from "../synSuite/window/SynSuiteStatus";
import {SynSuiteSelection} from "../synSuite/window/SynSuiteWindowState";

/** Statuses of the summary, in the order of the share bar */
const STATUSES: SynSuiteDisplayStatus[] = [SynSuiteTestStatus.PASSED, SynSuiteTestStatus.FAILED, SynSuiteTestStatus.ERROR, "idle"];
const MAX_FAILING_SHOWN = 3;

type RunSummary = { finishedAt: number, count: number, duration: number };

/**
 * Debug tools pane tab summarizing the suite: its overall state as a headline, the share of each status, and
 * shortcuts to run it and to open the SynSuite window.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class SynSuiteLauncher extends UIComponent {
    private progress: { done: number, total: number } | null = null;
    private lastRun: RunSummary | null = null;

    constructor() {
        super(HTMLUtils.createDiv("syn-suite-launcher"));
    }

    private get engine(): SynSuiteEngine {
        return SynSuiteEngine.getInstance();
    }

    draw(): void {
        const root = this.getUnderlyingElement();
        root.innerHTML = "";

        const tests = this.engine.getStore().getAll();
        const counts = new Map(STATUSES.map(status => [status, tests.filter(test => this.statusOf(test) === status).length]));

        const hero = HTMLUtils.createDiv("syn-suite-hero", root);
        HTMLUtils.createDiv("syn-suite-hero-overline", hero).textContent = "SynSuite";
        this.renderHeadline(hero, tests, counts);

        if (tests.length > 0) {
            this.renderShareBar(hero, tests.length, counts);
            this.renderDetails(hero, counts);
        }
        this.renderActions(hero, tests);
        this.renderFailing(root, tests);

        const hint = HTMLUtils.createDiv("syn-suite-hero-hint", root);
        hint.innerHTML = `<kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>T</kbd>`;
        hint.append("snapshot the opened file");
    }

    dispose(): void {
        const bus = GlobalState.getMainEventBus();
        bus.unsubscribe(this, SynSuiteTestsChangedEvent.SUBSCRIBER);
        bus.unsubscribe(this, SynSuiteTestsRunEvent.SUBSCRIBER);
        super.dispose();
    }

    // The pane disposes and re-adds its tabs on every draw: subscribe on mount so that it pairs with dispose
    protected mount(parent: UIComponent) {
        super.mount(parent);

        const bus = GlobalState.getMainEventBus();
        bus.unsubscribe(this, SynSuiteTestsChangedEvent.SUBSCRIBER);
        bus.unsubscribe(this, SynSuiteTestsRunEvent.SUBSCRIBER);
        bus.subscribe(this, SynSuiteTestsChangedEvent.SUBSCRIBER, () => this.redraw());
        bus.subscribe(this, SynSuiteTestsRunEvent.SUBSCRIBER, e => {
            const results = e.getResults();
            this.lastRun = {
                finishedAt: Date.now(),
                count: results.length,
                duration: results.reduce((sum, result) => sum + result.getTotalTime(), 0)
            };
            this.redraw();
        });
    }

    private statusOf(test: SynSuiteTest): SynSuiteDisplayStatus {
        const status = this.engine.getLastResult(test.id)?.getStatus() ?? "idle";
        // Timeouts are errors as far as this summary is concerned
        return status === SynSuiteTestStatus.TIMED_OUT ? SynSuiteTestStatus.ERROR : status;
    }

    /** The overall state in a few words, tinted by how it goes */
    private renderHeadline(hero: HTMLElement, tests: SynSuiteTest[], counts: Map<SynSuiteDisplayStatus, number>) {
        const headline = HTMLUtils.createDiv("syn-suite-hero-headline", hero);
        const failing = counts.get(SynSuiteTestStatus.FAILED)! + counts.get(SynSuiteTestStatus.ERROR)!;
        const idle = counts.get("idle")!;

        let text: string, tone: string;
        if (this.progress) {
            text = `Running ${this.progress.done}/${this.progress.total}`;
            tone = "running";
        } else if (tests.length === 0) {
            text = "No test yet";
            tone = "idle";
        } else if (failing > 0) {
            text = `${failing} failing`;
            tone = "failed";
        } else if (idle === tests.length) {
            text = `${tests.length} test${tests.length === 1 ? "" : "s"} not run`;
            tone = "idle";
        } else {
            text = idle === 0 ? "All passing" : `${tests.length - idle} passing`;
            tone = "passed";
        }

        headline.classList.add(tone);
        headline.textContent = text;
    }

    /** A thin bar split by the share of each status */
    private renderShareBar(hero: HTMLElement, total: number, counts: Map<SynSuiteDisplayStatus, number>) {
        const bar = HTMLUtils.createDiv("syn-suite-hero-bar", hero);
        for (const [status, count] of counts) {
            if (count === 0) continue;
            const segment = HTMLUtils.createDiv("syn-suite-hero-bar-segment", bar);
            segment.classList.add(status);
            segment.style.flexGrow = String(count / total);
            segment.title = `${count} ${SynSuiteStatus.label(status).toLowerCase()}`;
        }
    }

    private renderDetails(hero: HTMLElement, counts: Map<SynSuiteDisplayStatus, number>) {
        const stats = HTMLUtils.createDiv("syn-suite-hero-stats", hero);
        for (const [status, count] of counts) {
            if (count === 0) continue;
            const stat = HTMLUtils.createElement("span.syn-suite-hero-stat", stats);
            stat.classList.add(status);
            stat.textContent = `${count} ${SynSuiteStatus.label(status).toLowerCase()}`;
        }

        const lastRun = HTMLUtils.createDiv("syn-suite-hero-last-run", hero);
        const time = (at: number) => new Date(at).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
        if (this.lastRun) {
            lastRun.textContent = `Last run ${time(this.lastRun.finishedAt)} · ${this.lastRun.count} test${this.lastRun.count === 1 ? "" : "s"} in ${SynSuiteStatus.duration(this.lastRun.duration)}`;
            return;
        }

        // Tests may have run before this tab was shown: fall back on the latest result
        const latest = Math.max(...this.engine.getStore().getAll()
            .map(test => this.engine.getLastResult(test.id)?.getFinishedAt() ?? 0));
        lastRun.textContent = latest > 0 ? `Last run ${time(latest)}` : "Not run since the editor started";
    }

    private renderActions(hero: HTMLElement, tests: SynSuiteTest[]) {
        const actions = HTMLUtils.createDiv("syn-suite-hero-actions", hero);

        const run = document.createElement("ide-button");
        run.setAttribute("secondary", "");
        if (this.progress || tests.length === 0) run.setAttribute("disabled", "");
        run.innerHTML = `<i class="fa-solid fa-play"></i>Run all`;
        run.addEventListener("click", () => this.runAll());
        actions.appendChild(run);

        const open = document.createElement("ide-button");
        open.setAttribute("primary", "");
        open.innerHTML = `<i class="fa-solid fa-up-right-from-square"></i>Open SynSuite`;
        open.addEventListener("click", () => this.open(null));
        actions.appendChild(open);
    }

    /** The first failing tests, each opening the window on itself */
    private renderFailing(root: HTMLElement, tests: SynSuiteTest[]) {
        const failing = tests.filter(test => SynSuiteStatus.isFailing(this.statusOf(test)));
        if (failing.length === 0) return;

        const list = HTMLUtils.createDiv("syn-suite-hero-failing", root);
        HTMLUtils.createDiv("overline", list).textContent = "Failing";
        for (const test of failing.slice(0, MAX_FAILING_SHOWN)) {
            const line = HTMLUtils.createDiv("syn-suite-hero-failing-line", list);
            line.title = "Open in SynSuite";
            line.appendChild(SynSuiteStatus.icon(this.statusOf(test)));
            HTMLUtils.createElement("span.name", line).textContent = test.name;
            HTMLUtils.createElement("span.group", line).textContent = SynSuiteGroups.of(test);
            line.addEventListener("click", () => this.open({kind: "test", id: test.id}));
        }
        if (failing.length > MAX_FAILING_SHOWN) {
            HTMLUtils.createDiv("syn-suite-hero-more", list).textContent = `and ${failing.length - MAX_FAILING_SHOWN} more`;
        }
    }

    private async runAll() {
        const tests = this.engine.getStore().getAll();
        if (this.progress || tests.length === 0) return;

        this.progress = {done: 0, total: tests.length};
        this.redraw();
        try {
            await this.engine.runTests(tests, (_, done, total) => {
                this.progress = {done, total};
                this.redraw();
            });
        } finally {
            this.progress = null;
            this.redraw();
        }
    }

    private open(selection: SynSuiteSelection | null) {
        IdeDialogUtilsCore.showDialog(new SynSuitePopup(selection));
    }
}
