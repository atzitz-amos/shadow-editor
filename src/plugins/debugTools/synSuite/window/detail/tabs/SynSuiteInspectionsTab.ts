import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {SynSuiteDetailTab, SynSuiteDetailTabs, SynSuiteInspectionRow, SynSuiteTestView} from "../SynSuiteDetailTab";
import {SynSuiteDetailTabId} from "../../SynSuiteWindowState";

const VERDICT_ICONS: Record<SynSuiteInspectionRow["verdict"], string> = {
    matched: "fa-solid fa-check",
    missing: "fa-solid fa-minus",
    unexpected: "fa-solid fa-plus",
    expected: "fa-regular fa-circle"
};

/**
 * The expected and reported inspections, and how they compare.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteInspectionsTab implements SynSuiteDetailTab {
    readonly id: SynSuiteDetailTabId = "inspections";
    readonly title = "Inspections";

    getBadge(view: SynSuiteTestView): string | null {
        if (!view.result?.getActual()) return null;
        const differences = view.result.getMissingInspections().length + view.result.getUnexpectedInspections().length;
        return differences > 0 ? String(differences) : null;
    }

    render(view: SynSuiteTestView, container: HTMLElement): void {
        const rows = SynSuiteDetailTabs.inspectionRows(view);
        if (rows.length === 0) {
            SynSuiteDetailTabs.emptyState(container, "fa-regular fa-circle-check",
                view.test.options.includeInspections ? "No inspection expected nor reported" : "Inspections are not checked by this test");
            return;
        }

        const table = HTMLUtils.createElement<HTMLTableElement>("table.syn-suite-table", container);
        const head = table.createTHead().insertRow();
        for (const title of ["Verdict", "Inspection", "Message", "Range"]) {
            head.appendChild(document.createElement("th")).textContent = title;
        }

        const body = table.createTBody();
        for (const {inspection, verdict} of rows) {
            const row = body.insertRow();

            const verdictCell = HTMLUtils.createElement("span.syn-suite-verdict", row.insertCell());
            verdictCell.classList.add(verdict);
            verdictCell.appendChild(document.createElement("i")).className = VERDICT_ICONS[verdict];
            verdictCell.append(verdict);

            const id = row.insertCell();
            id.className = "mono";
            id.textContent = inspection.inspectionId.split(".").pop()!;
            id.title = inspection.inspectionId + (inspection.pluginId ? ` (${inspection.pluginId})` : "");

            row.insertCell().textContent = inspection.message;

            const range = row.insertCell();
            range.className = "mono";
            range.textContent = `${inspection.range.start}–${inspection.range.end}`;
        }
    }
}
