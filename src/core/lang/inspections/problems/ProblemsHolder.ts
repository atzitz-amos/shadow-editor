import {CodeProblem} from "./CodeProblem";
import {SynFile} from "../../syntax/api/SynFile";
import {InspectionBase} from "../Inspection";
import {SynNode} from "../../syntax/api/SynNode";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {QuickFix} from "../quickfix/QuickFix";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class ProblemsHolder {
    private problems: CodeProblem[] = [];

    public constructor(private readonly file: SynFile) {
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
