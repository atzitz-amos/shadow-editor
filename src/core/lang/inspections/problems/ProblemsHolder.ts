import {CodeProblem} from "./CodeProblem";
import {InspectionBase} from "../Inspection";
import {SynNode} from "../../syntax/api/SynNode";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {QuickFix} from "../quickfix/QuickFix";
import {SynDocument} from "../../syntax/api/document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class ProblemsHolder {
    private problems: CodeProblem[] = [];

    public constructor(private readonly document: SynDocument) {
    }

    public registerProblem(inspection: InspectionBase, description: string, node: SynNode, fixes: QuickFix[] = [], range?: TextRange) {
        if (!range) {
            range = node.getTextRange();
        }
        let problem = new CodeProblem(inspection, description, node, range);
        this.problems.push(problem);

        for (const fix of fixes) {
            problem.addQuickFix(fix);
        }
    }

    getProblems() {
        return this.problems;
    }

    clear() {
        this.problems = [];
    }
}
