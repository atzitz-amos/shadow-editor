import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

export class RISCVITypeInstruction extends RISCVInstruction {
    getDestinationRegister() {
        return this.getRegisters()[0];
    }

    getSourceRegister() {
        return this.getRegisters()[1];
    }

    getValue() {
        return this.getNumberLiterals()[0] ?? this.getIdentifiers()[0];
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitITypeInstruction(this);
        super.accept(visitor);
    }
}
