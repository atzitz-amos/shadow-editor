import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

export class RISCVStoreInstruction extends RISCVInstruction {
    getSourceRegister() {
        return this.getRegisters()[0];
    }

    getOffset() {
        return this.getNumberLiterals()[0];
    }

    getBaseRegister() {
        return this.getRegisters()[1];
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitStoreInstruction(this);
        super.accept(visitor);
    }
}
