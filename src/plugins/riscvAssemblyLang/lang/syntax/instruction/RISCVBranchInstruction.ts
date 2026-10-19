import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";
import {RISCVLabelReference} from "../literal/RISCVLabelReference";

export class RISCVBranchInstruction extends RISCVInstruction {
    getFirstSourceRegister() {
        return this.getRegisters()[0];
    }

    getSecondSourceRegister() {
        return this.getRegisters()[1];
    }

    getTargetLabel() {
        return this.getNthChildOfType(RISCVLabelReference, 0);
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitBranchInstruction(this);
        super.accept(visitor);
    }
}
