import {RISCVControlFlowNode} from "./RISCVControlFlowNode";
import {RISCVJalInstruction} from "../../../lang/syntax/instruction/RISCVJalInstruction";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVControlFlowJalNode extends RISCVControlFlowNode {

    constructor(private readonly node: RISCVJalInstruction) {
        super([node]);
    }

    getTarget(): string {
        return this.node.getTargetLabel()!.getName();
    }
}
