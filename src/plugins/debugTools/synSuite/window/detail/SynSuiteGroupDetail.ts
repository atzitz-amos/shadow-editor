import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SynSuiteGroups} from "../../../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteTestStatus} from "../../../../../app/testLib/lang/suite/SynSuiteTestResult";
import {SynSuiteWindowContext} from "../SynSuiteWindowContext";
import {SynSuiteStatus} from "../SynSuiteStatus";
import {SynSuiteDetailTabs} from "./SynSuiteDetailTab";
import {SynSuiteElements} from "../SynSuiteElements";

/**
 * Detail of a group: how its tests are doing, and the list of them.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteGroupDetail extends UIComponent {
    private group: string = SynSuiteGroups.ROOT;

    constructor(private readonly context: SynSuiteWindowContext) {
        super(HTMLUtils.createDiv("syn-suite-detail"));
    }

    show(group: string): void {
        this.group = group;
        this.draw();
    }

    draw(): void {
        const root = this.getUnderlyingElement();
        root.innerHTML = "";

        const tests = this.context.getTestsIn(this.group);
        const failing = tests.filter(test => SynSuiteStatus.isFailing(this.context.statusOf(test)));
        const isRoot = this.group === SynSuiteGroups.ROOT;

        const head = HTMLUtils.createDiv("syn-suite-detail-head", root);
        HTMLUtils.createDiv("syn-suite-detail-path", head).textContent = isRoot ? "All tests" : this.group;

        const titleRow = HTMLUtils.createDiv("syn-suite-detail-title-row", head);
        titleRow.appendChild(document.createElement("i")).className = "syn-suite-group-icon fa-regular fa-folder-open";
        HTMLUtils.createElement("span.syn-suite-detail-name", titleRow).textContent =
            isRoot ? "All tests" : SynSuiteGroups.lastSegment(this.group);

        const actions = HTMLUtils.createDiv("syn-suite-detail-actions", titleRow);
        SynSuiteElements.button(actions, "Run group", "fa-solid fa-play",
            !this.context.runner.isRunning() && tests.length > 0,
            () => this.context.runner.run(tests));
        SynSuiteElements.button(actions, "New subgroup", "fa-solid fa-plus", true,
            () => this.context.organizer.createGroup(this.group));
        if (!isRoot) {
            SynSuiteElements.button(actions, "Rename", "fa-solid fa-pen", true,
                () => this.context.organizer.renameGroup(this.group));
        }

        const status = tests.length === 0 ? "idle" : failing.length > 0 ? SynSuiteTestStatus.FAILED : SynSuiteTestStatus.PASSED;
        const banner = HTMLUtils.createDiv(`syn-suite-banner`, head);
        banner.classList.add(status);
        banner.append(SynSuiteStatus.icon(status), tests.length === 0
            ? "This group has no test yet"
            : failing.length > 0
                ? `${failing.length} of ${tests.length} test${tests.length > 1 ? "s" : ""} failing`
                : `${tests.length} test${tests.length > 1 ? "s" : ""}, none failing`);

        const body = HTMLUtils.createDiv("syn-suite-tab-body", root);
        if (tests.length === 0) {
            SynSuiteDetailTabs.emptyState(body, "fa-solid fa-camera", "Snapshot a file with Ctrl+Alt+T to add tests here");
            return;
        }

        const list = HTMLUtils.createDiv("syn-suite-group-list", body);
        for (const test of tests) {
            const line = HTMLUtils.createDiv("syn-suite-group-line", list);
            line.appendChild(SynSuiteStatus.icon(this.context.statusOf(test)));
            HTMLUtils.createElement("span.name", line).textContent = test.name;
            HTMLUtils.createElement("span.path", line).textContent = SynSuiteGroups.of(test);

            const result = this.context.resultOf(test);
            HTMLUtils.createElement("span.time", line).textContent = result ? SynSuiteStatus.duration(result.getTotalTime()) : "—";

            line.addEventListener("click", () => this.context.state.select({kind: "test", id: test.id}));
        }
    }
}
