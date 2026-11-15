import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../core/utils/HTMLUtils";
import {SynSuiteError} from "../../../../../app/testLib/lang/suite/SynSuiteEngine";
import {SynSuiteGroups, SynSuiteTest} from "../../../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteTestStatus} from "../../../../../app/testLib/lang/suite/SynSuiteTestResult";
import {SynSuiteWindowContext} from "../SynSuiteWindowContext";
import {SynSuiteStatus} from "../SynSuiteStatus";
import {SynSuiteDetailTab, SynSuiteTestView} from "./SynSuiteDetailTab";
import {SynSuiteElements} from "../SynSuiteElements";

/**
 * Detail of a test: its identity and actions, the outcome of its last run, and the tabs showing its content.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteTestDetail extends UIComponent {
    private testId: string | null = null;
    private actionError: string | null = null;

    constructor(private readonly context: SynSuiteWindowContext, private readonly tabs: SynSuiteDetailTab[]) {
        super(HTMLUtils.createDiv("syn-suite-detail"));
    }

    show(test: SynSuiteTest): void {
        if (this.testId !== test.id) this.actionError = null;
        this.testId = test.id;
        this.draw();
    }

    draw(): void {
        const root = this.getUnderlyingElement();
        root.innerHTML = "";

        const test = this.testId ? this.context.store.get(this.testId) : null;
        if (!test) return;

        const view: SynSuiteTestView = {test, result: this.context.resultOf(test), status: this.context.statusOf(test)};
        this.renderHead(view, HTMLUtils.createDiv("syn-suite-detail-head", root));

        const tab = this.tabs.find(t => t.id === this.context.state.getTab()) ?? this.tabs[0];
        this.renderTabStrip(view, tab, HTMLUtils.createDiv("syn-suite-tabs", root));
        tab.render(view, HTMLUtils.createDiv("syn-suite-tab-body", root));
    }

    // ---- head ----

    private renderHead(view: SynSuiteTestView, head: HTMLElement) {
        const {test, result, status} = view;

        const path = HTMLUtils.createDiv("syn-suite-detail-path", head);
        if (SynSuiteGroups.of(test) !== SynSuiteGroups.ROOT) path.append(SynSuiteGroups.of(test) + ".");
        HTMLUtils.createElement("b", path).textContent = test.name;

        const titleRow = HTMLUtils.createDiv("syn-suite-detail-title-row", head);
        titleRow.appendChild(SynSuiteStatus.icon(status));
        HTMLUtils.createElement("span.syn-suite-detail-name", titleRow).textContent = test.name;

        const actions = HTMLUtils.createDiv("syn-suite-detail-actions", titleRow);
        const running = this.context.runner.isRunning();
        SynSuiteElements.button(actions, "Run", "fa-solid fa-play", !running, () => this.context.runner.run([test]));
        SynSuiteElements.button(actions, "Accept actual", "fa-solid fa-check",
            !running && status === SynSuiteTestStatus.FAILED,
            () => this.acceptActual(test), "Make the actual output the new expected snapshot");
        SynSuiteElements.dangerIconButton(actions, "fa-regular fa-trash-can", "Delete test", !running,
            () => this.context.organizer.deleteTest(test));

        if (test.description) HTMLUtils.createDiv("syn-suite-detail-description", head).textContent = test.description;

        const meta = HTMLUtils.createDiv("syn-suite-meta", head);
        SynSuiteElements.metaItem(meta, "fa-solid fa-code", test.language);
        SynSuiteElements.metaItem(meta, "fa-solid fa-magnifying-glass",
            test.options.includeInspections ? test.options.pluginIds.join(", ") || "No plugin" : "Inspections not checked");
        if (result) SynSuiteElements.metaItem(meta, "fa-regular fa-clock", SynSuiteStatus.duration(result.getTotalTime()));

        const banner = HTMLUtils.createDiv("syn-suite-banner", head);
        if (this.actionError) {
            banner.classList.add(SynSuiteTestStatus.ERROR);
            banner.append(SynSuiteStatus.icon(SynSuiteTestStatus.ERROR), this.actionError);
        } else {
            banner.classList.add(status);
            banner.append(SynSuiteStatus.icon(status), this.describe(view));
        }
    }

    /** One line explaining the status */
    private describe({result, status}: SynSuiteTestView): string {
        switch (status) {
            case SynSuiteTestStatus.PASSED:
                return `Passed in ${SynSuiteStatus.duration(result!.getTotalTime())}`;
            case SynSuiteTestStatus.FAILED: {
                const reasons: string[] = [];
                if (!result!.isTreeMatching()) reasons.push("the tree differs");
                const missing = result!.getMissingInspections().length;
                const unexpected = result!.getUnexpectedInspections().length;
                if (missing) reasons.push(`${missing} expected inspection${missing > 1 ? "s" : ""} missing`);
                if (unexpected) reasons.push(`${unexpected} unexpected inspection${unexpected > 1 ? "s" : ""}`);
                return "Failed: " + reasons.join(", ");
            }
            case SynSuiteTestStatus.TIMED_OUT:
                return "The parser did not finish in time";
            case SynSuiteTestStatus.ERROR:
                // Only the first line, stacks go in the console
                return "Error: " + (result?.getErrors()[0]?.split("\n")[0] ?? "unknown error");
            case "running":
                return "Running…";
            case "queued":
                return "Waiting for the tests before it";
            case "idle":
                return "Not run yet";
        }
    }

    // ---- tabs ----

    private renderTabStrip(view: SynSuiteTestView, active: SynSuiteDetailTab, strip: HTMLElement) {
        for (const tab of this.tabs) {
            const button = HTMLUtils.createElement<HTMLButtonElement>("button.syn-suite-tab", strip);
            button.type = "button";
            button.classList.toggle("active", tab === active);
            button.textContent = tab.title;

            const badge = tab.getBadge(view);
            if (badge !== null) HTMLUtils.createElement("span.syn-suite-tab-badge", button).textContent = badge;

            button.addEventListener("click", () => this.context.state.setTab(tab.id));
        }
    }

    // ---- actions ----

    private async acceptActual(test: SynSuiteTest) {
        const result = this.context.resultOf(test);
        if (!result) return;

        try {
            const updated = this.context.engine.acceptActual(result);
            this.actionError = null;
            // Run it again so that it shows as passing with the new snapshot
            await this.context.runner.run([updated]);
        } catch (e) {
            if (!(e instanceof SynSuiteError)) throw e;
            this.actionError = e.message;
            this.draw();
        }
    }

}
