import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

export class RISCVUnaryInstruction extends RISCVInstruction {
    getDestinationRegister() {
        return this.getRegisters()[0];
    }

    getSourceRegister() {
        return this.getRegisters()[1];
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitUnaryInstruction(this);
        super.accept(visitor);
    }
}
