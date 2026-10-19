import {RISCVControlFlowNode} from "./RISCVControlFlowNode";
import {RISCVBranchInstruction} from "../../../lang/syntax/instruction/RISCVBranchInstruction";
import {RISCVBranchZInstruction} from "../../../lang/syntax/instruction/RISCVBranchZInstruction";
import {RISCVJumpInstruction} from "../../../lang/syntax/instruction/RISCVJumpInstruction";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVControlFlowBranchNode extends RISCVControlFlowNode {

    constructor(private readonly node: RISCVBranchInstruction | RISCVBranchZInstruction | RISCVJumpInstruction) {
        super([node]);
    }

    getTarget(): string {
        return this.node.getTargetLabel()?.getName()!;
    }
}
