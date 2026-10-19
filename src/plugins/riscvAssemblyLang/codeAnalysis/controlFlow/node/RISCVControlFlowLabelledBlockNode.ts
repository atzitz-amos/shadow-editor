import {RISCVControlFlowNode} from "./RISCVControlFlowNode";
import {RISCVLabelDeclaration} from "../../../lang/syntax/instruction/RISCVLabelDeclaration";
import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVControlFlowLabelledBlockNode extends RISCVControlFlowNode {

    constructor(private readonly label: RISCVLabelDeclaration, nodes: SynASTElement[]) {
        super(nodes);
    }

    getName() {
        return this.label.getName();
    }

    getLabel() {
        return this.label;
    }
}
