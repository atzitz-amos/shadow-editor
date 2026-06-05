import {SynSuiteInspection, SynSuiteParserTest} from "./SynSuiteParserTest";

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
                        expected.range.getStart() === actual.range.getStart() &&
                        expected.range.end === actual.range.end;
                });
            });

        return treeMatches && inspectionsMatch;
    }
}
