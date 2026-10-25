import {SynSuiteDetailTab, SynSuiteDetailTabs, SynSuiteTestView} from "../SynSuiteDetailTab";
import {SynSuiteDetailTabId} from "../../SynSuiteWindowState";
import {IdeDonutChart} from "../../../../../../core/ui/lib/charts/IdeDonutChart";
import {SynSuiteStatus} from "../../SynSuiteStatus";

/** Cool, analogous tones that stay clear of the status colors */
const PHASE_COLORS = {
    lexer: "#5fb3d9",
    parser: "#7b8cf0",
    analysis: "#b98ae6"
};

/**
 * Time spent in each phase of the last run, as a donut.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteTimingsTab implements SynSuiteDetailTab {
    readonly id: SynSuiteDetailTabId = "timings";
    readonly title = "Timings";

    getBadge(): string | null {
        return null;
    }

    render(view: SynSuiteTestView, container: HTMLElement): void {
        if (!view.result) {
            SynSuiteDetailTabs.emptyState(container, "fa-regular fa-clock", "Run the test to measure it");
            return;
        }

        const timings = view.result.getTimings();
        const chart = new IdeDonutChart([
            {label: "Lexer", value: timings.lexer, color: PHASE_COLORS.lexer},
            {label: "Parser", value: timings.parser, color: PHASE_COLORS.parser},
            {label: "Analysis", value: timings.analysis, color: PHASE_COLORS.analysis}
        ], {format: SynSuiteStatus.duration});

        container.appendChild(chart.getUnderlyingElement());
        chart.getUnderlyingElement().classList.add("syn-suite-timings");
        chart.draw();
    }
}
