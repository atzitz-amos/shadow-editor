import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

export class RISCVRTypeInstruction extends RISCVInstruction {
    getDestinationRegister() {
        return this.getRegisters()[0];
    }

    getSourceRegister() {
        return this.getRegisters()[1];
    }

    getSecondSourceRegister() {
        return this.getRegisters()[2];
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitRTypeInstruction(this);
        super.accept(visitor);
    }
}
