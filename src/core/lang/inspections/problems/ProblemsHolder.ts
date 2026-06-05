import {CodeProblem} from "./CodeProblem";
import {SynFile} from "../../syntax/api/SynFile";
import {InspectionBase} from "../Inspection";
import {SynNode} from "../../syntax/api/SynNode";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";

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

    public registerProblem(inspection: InspectionBase, description: string, node: SynNode, range?: TextRange) {
        if (!range) {
            range = node.getTextRange();
        }
        this.problems.push(new CodeProblem(inspection, description, node, range));
    }

    getProblems() {
        return this.problems;
    }

    clear() {
        this.problems = [];
    }
}
