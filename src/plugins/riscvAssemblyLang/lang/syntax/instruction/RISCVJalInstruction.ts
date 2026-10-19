import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";
import {RISCVLabelReference} from "../literal/RISCVLabelReference";

export class RISCVJalInstruction extends RISCVInstruction {
    getTargetLabel() {
        return this.getNthChildOfType(RISCVLabelReference, 0);
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitJalInstruction(this);
        super.accept(visitor);
    }
}
