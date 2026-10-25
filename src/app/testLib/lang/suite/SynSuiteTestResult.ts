import {SynSuiteInspection, SynSuiteSnapshot, SynSuiteTest} from "./SynSuiteTest";
import {SynDocument} from "../../../../lang/syntax/api/document/SynDocument";

export enum SynSuiteTestStatus {
    PASSED = "passed",
    FAILED = "failed",
    /** The parser did not finish in time */
    TIMED_OUT = "timed_out",
    /** The test could not run to completion: unknown language, crash of the parser or of an analysis visitor */
    ERROR = "error"
}

export type SynSuiteTimings = {
    lexer: number,
    parser: number,
    analysis: number
}

/**
 * Outcome of running the SynSuite pipeline (lexer, parser and code analysis) on a piece of code.
 */
export type SynSuiteExecution = {
    /** null if the pipeline did not complete */
    actual: SynSuiteSnapshot | null,
    timings: SynSuiteTimings,
    timedOut: boolean,
    errors: string[],
    /** The document the code was analysed in, null if it could not be created */
    synDocument: SynDocument | null
}

/**
 * How an inspection compares between the expected snapshot and the actual output.
 */
export type SynSuiteInspectionVerdict = "matched" | "missing" | "unexpected";

export type SynSuiteInspectionComparison = {
    inspection: SynSuiteInspection,
    verdict: SynSuiteInspectionVerdict
}

/**
 * Result of running a {@link SynSuiteTest}: its actual output compared to the expected snapshot.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class SynSuiteTestResult {
    private readonly status: SynSuiteTestStatus;
    private readonly missingInspections: SynSuiteInspection[];
    private readonly unexpectedInspections: SynSuiteInspection[];

    public constructor(private readonly test: SynSuiteTest,
                       private readonly execution: SynSuiteExecution,
                       private readonly finishedAt: number = Date.now()) {
        const actual = execution.actual;

        this.missingInspections = actual ? SynSuiteTestResult.difference(test.expected.inspections, actual.inspections) : [];
        this.unexpectedInspections = actual ? SynSuiteTestResult.difference(actual.inspections, test.expected.inspections) : [];

        if (execution.timedOut) {
            this.status = SynSuiteTestStatus.TIMED_OUT;
        } else if (!actual || execution.errors.length > 0) {
            this.status = SynSuiteTestStatus.ERROR;
        } else if (this.isTreeMatching() && this.missingInspections.length === 0 && this.unexpectedInspections.length === 0) {
            this.status = SynSuiteTestStatus.PASSED;
        } else {
            this.status = SynSuiteTestStatus.FAILED;
        }
    }

    public static inspectionKey(inspection: SynSuiteInspection): string {
        return `${inspection.inspectionId}@${inspection.range.start}:${inspection.range.end}#${inspection.message}`;
    }

    /**
     * @returns the inspections of {@code from} that are not in {@code other}, compared as multisets
     */
    private static difference(from: SynSuiteInspection[], other: SynSuiteInspection[]): SynSuiteInspection[] {
        const remaining = new Map<string, number>();
        for (const inspection of other) {
            const key = SynSuiteTestResult.inspectionKey(inspection);
            remaining.set(key, (remaining.get(key) ?? 0) + 1);
        }

        return from.filter(inspection => {
            const key = SynSuiteTestResult.inspectionKey(inspection);
            const count = remaining.get(key) ?? 0;
            if (count === 0) return true;
            remaining.set(key, count - 1);
            return false;
        });
    }

    public getTest(): SynSuiteTest {
        return this.test;
    }

    public getStatus(): SynSuiteTestStatus {
        return this.status;
    }

    public isPassed(): boolean {
        return this.status === SynSuiteTestStatus.PASSED;
    }

    public getExpected(): SynSuiteSnapshot {
        return this.test.expected;
    }

    public getActual(): SynSuiteSnapshot | null {
        return this.execution.actual;
    }

    public isTreeMatching(): boolean {
        return this.execution.actual !== null && this.execution.actual.tree === this.test.expected.tree;
    }

    /**
     * @returns the expected inspections that were not reported
     */
    public getMissingInspections(): SynSuiteInspection[] {
        return this.missingInspections;
    }

    /**
     * @returns the reported inspections that were not expected
     */
    public getUnexpectedInspections(): SynSuiteInspection[] {
        return this.unexpectedInspections;
    }

    /**
     * @returns every expected and actual inspection with how it compares, sorted by position. Empty when the
     * test produced no output.
     */
    public getInspectionComparisons(): SynSuiteInspectionComparison[] {
        if (!this.execution.actual) return [];

        const matched = SynSuiteTestResult.difference(this.test.expected.inspections, this.missingInspections);
        return [
            ...matched.map(inspection => ({inspection, verdict: "matched" as const})),
            ...this.missingInspections.map(inspection => ({inspection, verdict: "missing" as const})),
            ...this.unexpectedInspections.map(inspection => ({inspection, verdict: "unexpected" as const}))
        ].sort((a, b) => a.inspection.range.start - b.inspection.range.start || a.inspection.range.end - b.inspection.range.end);
    }

    public getErrors(): string[] {
        return this.execution.errors;
    }

    public getTimings(): SynSuiteTimings {
        return this.execution.timings;
    }

    public getTotalTime(): number {
        const timings = this.execution.timings;
        return timings.lexer + timings.parser + timings.analysis;
    }

    public getSynDocument(): SynDocument | null {
        return this.execution.synDocument;
    }

    public getFinishedAt(): number {
        return this.finishedAt;
    }
}
