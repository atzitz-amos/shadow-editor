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
export class CodeProblem {
    private readonly quickFixes: QuickFix[] = [];

    constructor(private readonly inspection: InspectionBase,
                private readonly description: string,
                private readonly node: SynNode,
                private readonly range: TextRange) {

    }

    public getInspection(): InspectionBase {
        return this.inspection;
    }

    public getNode(): SynNode {
        return this.node;
    }

    public getDescription() {
        return this.description;
    }

    public getRange(): TextRange {
        return this.range;
    }

    public addQuickFix(quickFix: QuickFix) {
        this.quickFixes.push(quickFix);
    }

    getQuickFixes() {
        return this.quickFixes;
    }
}
