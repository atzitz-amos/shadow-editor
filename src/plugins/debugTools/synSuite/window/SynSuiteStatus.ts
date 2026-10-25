import {SynSuiteTestStatus} from "../../../../app/testLib/lang/suite/SynSuiteTestResult";

/**
 * Status of a test as displayed: the status of its last result, or where it stands in the current run.
 */
export type SynSuiteDisplayStatus = SynSuiteTestStatus | "idle" | "queued" | "running";

const PRESENTATION: Record<SynSuiteDisplayStatus, { label: string, icon: string }> = {
    [SynSuiteTestStatus.PASSED]: {label: "Passed", icon: "fa-solid fa-check"},
    [SynSuiteTestStatus.FAILED]: {label: "Failed", icon: "fa-solid fa-xmark"},
    [SynSuiteTestStatus.TIMED_OUT]: {label: "Timed out", icon: "fa-regular fa-hourglass-half"},
    [SynSuiteTestStatus.ERROR]: {label: "Error", icon: "fa-solid fa-triangle-exclamation"},
    idle: {label: "Not run", icon: "fa-regular fa-circle"},
    queued: {label: "Queued", icon: "fa-regular fa-clock"},
    running: {label: "Running", icon: "fa-solid fa-spinner fa-spin"}
};

/**
 * How statuses look: a test shows its status as its icon, in soft tones (see syn_suite.css).
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteStatus {
    static label(status: SynSuiteDisplayStatus): string {
        return PRESENTATION[status].label;
    }

    /** Css classes of the icon element */
    static iconClasses(status: SynSuiteDisplayStatus): string {
        return `syn-suite-status ${status} ${PRESENTATION[status].icon}`;
    }

    static icon(status: SynSuiteDisplayStatus): HTMLElement {
        const icon = document.createElement("i");
        icon.className = SynSuiteStatus.iconClasses(status);
        icon.title = SynSuiteStatus.label(status);
        return icon;
    }

    static isFailing(status: SynSuiteDisplayStatus): boolean {
        return status === SynSuiteTestStatus.FAILED || status === SynSuiteTestStatus.ERROR || status === SynSuiteTestStatus.TIMED_OUT;
    }

    /** Formats a duration in milliseconds */
    static duration(ms: number): string {
        return ms >= 100 ? Math.round(ms) + "ms" : ms.toFixed(2) + "ms";
    }
}
