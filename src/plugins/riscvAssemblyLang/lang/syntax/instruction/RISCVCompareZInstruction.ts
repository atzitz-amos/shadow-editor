import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

export class RISCVCompareZInstruction extends RISCVInstruction {
    getDestinationRegister() {
        return this.getRegisters()[0];
    }

    getSourceRegister() {
        return this.getRegisters()[1];
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitCompareZInstruction(this);
        super.accept(visitor);
    }
}
