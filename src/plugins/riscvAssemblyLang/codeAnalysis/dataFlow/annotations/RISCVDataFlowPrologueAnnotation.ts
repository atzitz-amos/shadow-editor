import {RISCVControlFlowNode} from "../../controlFlow/node/RISCVControlFlowNode";
import {DataFlowAnnotation} from "../DataFlowAnnotation";
import {RISCVITypeInstruction} from "../../../lang/syntax/instruction/RISCVITypeInstruction";
import {RISCVStoreInstruction} from "../../../lang/syntax/instruction/RISCVStoreInstruction";
import {RISCVLoadInstruction} from "../../../lang/syntax/instruction/RISCVLoadInstruction";

export type RISCVProcedurePrologue = {
    spAddInstr: RISCVITypeInstruction,
    storeInstr: RISCVStoreInstruction[],
    loadInstr: RISCVLoadInstruction[],
    spChange: number,
    store: Map<number, string>,
    load: Map<number, string>
}

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVDataFlowPrologueAnnotation extends DataFlowAnnotation<RISCVProcedurePrologue> {
    merge(source: RISCVControlFlowNode, value: RISCVProcedurePrologue, other: RISCVProcedurePrologue | undefined): RISCVProcedurePrologue | undefined {
        if (other === undefined) return value;

    }
}
