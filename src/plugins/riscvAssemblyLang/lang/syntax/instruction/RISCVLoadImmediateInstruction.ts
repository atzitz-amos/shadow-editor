import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export class RISCVLoadImmediateInstruction extends RISCVInstruction {
    getDestinationRegister() {
        return this.getRegisters()[0];
    }

    getValue() {
        return this.getNumberLiterals()[0] ?? this.getIdentifiers()[0];
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitLoadImmediateInstruction(this);
        super.accept(visitor);
    }
}
