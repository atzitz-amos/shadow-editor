import {SynSuiteInspection, SynSuiteParserTest} from "./SynSuiteParserTest";
import {GlobalState} from "../../global/GlobalState";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class SynAutomatedTestResult {
    public constructor(public test: SynSuiteParserTest,
                       public warnings: string[],
                       public actualTree: string,
                       public actualInspections: SynSuiteInspection[],
                       public lexerTime: number,
                       public parserTime: number,
                       public inspectionTime: number) {

    }

    public passed(): boolean {
        const treeMatches = this.test.expectedTree === this.actualTree;
        const inspectionsMatch = this.test.expectedInspections.length === this.actualInspections.length &&
            this.test.expectedInspections.every(expected => {
                return this.actualInspections.some(actual => {
                    return expected.inspectionKey === actual.inspectionKey &&
                        expected.message === actual.message &&
                        expected.range.start === actual.range.start &&
                        expected.range.end === actual.range.end;
                });
            });

        return treeMatches && inspectionsMatch;
    }

    getTotalTime() {
        return this.lexerTime + this.parserTime + this.inspectionTime;
    }

    markAccepted() {
        // Modify the test in SynSuiteEngine to set the expected tree and inspections to the actual results

        GlobalState.getSynSuiteEngine().patchTest(this.test.pluginId, this.test.key, {
            expectedTree: this.actualTree,
            expectedInspections: this.actualInspections
        })
    }
}
