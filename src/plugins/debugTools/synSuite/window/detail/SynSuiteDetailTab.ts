import {SynSuiteInspection, SynSuiteTest} from "../../../../../app/testLib/lang/suite/SynSuiteTest";
import {SynSuiteInspectionVerdict, SynSuiteTestResult} from "../../../../../app/testLib/lang/suite/SynSuiteTestResult";
import {SynSuiteDisplayStatus} from "../SynSuiteStatus";
import {SynSuiteDetailTabId} from "../SynSuiteWindowState";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";

/**
 * A test as shown in the detail pane: the test, its last result and its current status.
 */
export type SynSuiteTestView = {
    test: SynSuiteTest,
    result: SynSuiteTestResult | null,
    status: SynSuiteDisplayStatus
}

/**
 * An inspection and how it compares to the expectation. Without any output to compare to, the expected
 * inspections are shown as "expected".
 */
export type SynSuiteInspectionRow = {
    inspection: SynSuiteInspection,
    verdict: SynSuiteInspectionVerdict | "expected"
}

/**
 * A tab of the detail pane of a test.
 */
export interface SynSuiteDetailTab {
    readonly id: SynSuiteDetailTabId;
    readonly title: string;

    /** Short text shown next to the title, e.g. how many inspections differ; null for none */
    getBadge(view: SynSuiteTestView): string | null;

    /** Fills the empty container with the content of the tab */
    render(view: SynSuiteTestView, container: HTMLElement): void;
}

export class SynSuiteDetailTabs {
    static inspectionRows(view: SynSuiteTestView): SynSuiteInspectionRow[] {
        if (view.result?.getActual()) return view.result.getInspectionComparisons();
        return view.test.expected.inspections.map(inspection => ({inspection, verdict: "expected"}));
    }

    static emptyState(container: HTMLElement, icon: string, text: string): void {
        const empty = HTMLUtils.createDiv("syn-suite-empty", container);
        empty.appendChild(document.createElement("i")).className = icon;
        HTMLUtils.createElement("span", empty).textContent = text;
    }
}
