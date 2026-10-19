import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

export class RISCVLoadInstruction extends RISCVInstruction {
    getDestinationRegister() {
        return this.getRegisters()[0];
    }

    getOffset() {
        return this.getNumberLiterals()[0];
    }

    getBaseRegister() {
        return this.getRegisters()[1];
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitLoadInstruction(this);
        super.accept(visitor);
    }
}
