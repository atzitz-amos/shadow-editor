import {RISCVControlFlowNode} from "./RISCVControlFlowNode";
import {RISCVRetInstruction} from "../../../lang/syntax/instruction/RISCVRetInstruction";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVControlFlowRetNode extends RISCVControlFlowNode {

    constructor(private readonly node: RISCVRetInstruction) {
        super([node]);
    }
}
