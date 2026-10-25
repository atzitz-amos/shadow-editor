import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {SynSuiteDetailTab, SynSuiteDetailTabs, SynSuiteInspectionRow, SynSuiteTestView} from "../SynSuiteDetailTab";
import {SynSuiteDetailTabId} from "../../SynSuiteWindowState";

/**
 * The code of the test, with the inspection ranges underlined according to how they compare.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteCodeTab implements SynSuiteDetailTab {
    readonly id: SynSuiteDetailTabId = "code";
    readonly title = "Code";

    getBadge(): string | null {
        return null;
    }

    render(view: SynSuiteTestView, container: HTMLElement): void {
        const rows = SynSuiteDetailTabs.inspectionRows(view);
        container.appendChild(this.renderCode(view.test.code, rows));

        if (rows.length > 0) {
            const legend = HTMLUtils.createDiv("syn-suite-code-legend", container);
            const verdicts = [...new Set(rows.map(row => row.verdict))];
            for (const verdict of verdicts) {
                HTMLUtils.createElement(`span.${verdict}`, legend).textContent = verdict;
            }
        }
    }

    private renderCode(code: string, rows: SynSuiteInspectionRow[]): HTMLElement {
        const pre = HTMLUtils.createElement("pre.syn-suite-code");

        // Overlapping ranges are not nested: a range starting inside another one is skipped
        const marks = new Map<number, SynSuiteInspectionRow>();
        for (const row of rows) {
            const {start, end} = row.inspection.range;
            if (end > start && !marks.has(start)) marks.set(start, row);
        }

        let line = HTMLUtils.createElement("span.syn-suite-code-line", pre);
        let target: HTMLElement = line;
        let open: SynSuiteInspectionRow | null = null;

        const startLine = () => {
            line = HTMLUtils.createElement("span.syn-suite-code-line", pre);
            // A range spanning several lines continues on the next one
            target = open ? this.createMark(open, line) : line;
        };

        for (let offset = 0; offset <= code.length; offset++) {
            if (open && offset >= open.inspection.range.end) {
                open = null;
                target = line;
            }
            if (!open && marks.has(offset)) {
                open = marks.get(offset)!;
                target = this.createMark(open, line);
            }
            if (offset === code.length) break;

            const char = code[offset];
            if (char === "\n") {
                startLine();
            } else {
                target.append(char);
            }
        }

        // No empty last line for a trailing line break
        if (line.textContent === "" && pre.childElementCount > 1) line.remove();
        return pre;
    }

    private createMark(row: SynSuiteInspectionRow, line: HTMLElement): HTMLElement {
        const mark = HTMLUtils.createElement(`span.syn-suite-code-problem`, line);
        mark.classList.add(row.verdict);
        mark.title = `${row.verdict}: ${row.inspection.message}`;
        return mark;
    }
}
