import {HTMLUtils} from "../../../../../../core/utils/HTMLUtils";
import {SynSuiteDetailTab, SynSuiteTestView} from "../SynSuiteDetailTab";
import {SynSuiteDetailTabId} from "../../SynSuiteWindowState";
import {IdeSideBySideDiff} from "../../../../../../core/ui/lib/diff/IdeSideBySideDiff";

/**
 * The expected and actual syntax trees, diffed side by side.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteTreeTab implements SynSuiteDetailTab {
    readonly id: SynSuiteDetailTabId = "tree";
    readonly title = "Tree";

    getBadge(view: SynSuiteTestView): string | null {
        return view.result?.getActual() && !view.result.isTreeMatching() ? "≠" : null;
    }

    render(view: SynSuiteTestView, container: HTMLElement): void {
        const actual = view.result?.getActual()?.tree ?? null;

        if (actual === null) {
            // Nothing to compare yet: the expected tree alone
            HTMLUtils.createDiv("syn-suite-tree-note", container).textContent = "Run the test to compare its output with the expected tree";
            HTMLUtils.createElement("pre.syn-suite-tree-expected", container).textContent = view.test.expected.tree;
            return;
        }

        const diff = new IdeSideBySideDiff(view.test.expected.tree, actual, {oldTitle: "Expected", newTitle: "Actual"});
        diff.getUnderlyingElement().classList.add("syn-suite-tree-diff");
        container.appendChild(diff.getUnderlyingElement());
        diff.draw();
    }
}
