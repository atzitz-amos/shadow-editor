import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";
import {RISCVLabelReference} from "../literal/RISCVLabelReference";

export class RISCVJumpInstruction extends RISCVInstruction {
    getTargetLabel() {
        return this.getNthChildOfType(RISCVLabelReference, 0);
    }

    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitJumpInstruction(this);
        super.accept(visitor);
    }
}
