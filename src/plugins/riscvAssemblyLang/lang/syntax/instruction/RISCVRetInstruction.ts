import {RISCVInstruction} from "./RISCVInstruction";
import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RISCVSynVisitor} from "../visitor/RISCVSynVisitor";

export class RISCVRetInstruction extends RISCVInstruction {
    accept(visitor: SynNodeVisitor): void {
        if (visitor instanceof RISCVSynVisitor) visitor.visitRetInstruction(this);
        super.accept(visitor);
    }
}
