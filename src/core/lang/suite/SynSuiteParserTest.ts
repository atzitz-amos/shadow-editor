/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export type SynSuiteParserTest = {
    key: string,
    description: string,
    code: string,
    language: string,
    expectedTree: string,
    expectedInspections: SynSuiteInspection[]
}


export type SynSuiteInspection = {
    inspectionKey: string, message: string, range: { start: number, end: number }
}
