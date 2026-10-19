import {SynNodeVisitor} from "../../../../../lang/syntax/visitors/SynNodeVisitor";
import {RiscVDirective} from "../directive/RiscVDirective";
import {RISCVSectionDirective} from "../directive/RISCVSectionDirective";
import {RISCVMemoryDirective} from "../directive/RISCVMemoryDirective";
import {RISCVEquDirective} from "../directive/RISCVEquDirective";
import {RISCVNumberLiteral} from "../literal/RISCVNumberLiteral";
import {RISCVStringLiteral} from "../literal/RISCVStringLiteral";
import {RISCVLabelReference} from "../literal/RISCVLabelReference";
import {RISCVRegister} from "../literal/RISCVRegister";
import {RISCVLabelDeclaration} from "../instruction/RISCVLabelDeclaration";
import {RISCVInstruction} from "../instruction/RISCVInstruction";
import {RISCVMoveInstruction} from "../instruction/RISCVMoveInstruction";
import {RISCVLoadImmediateInstruction} from "../instruction/RISCVLoadImmediateInstruction";
import {RISCVLoadAddressInstruction} from "../instruction/RISCVLoadAddressInstruction";
import {RISCVRTypeInstruction} from "../instruction/RISCVRTypeInstruction";
import {RISCVITypeInstruction} from "../instruction/RISCVITypeInstruction";
import {RISCVUnaryInstruction} from "../instruction/RISCVUnaryInstruction";
import {RISCVJumpInstruction} from "../instruction/RISCVJumpInstruction";
import {RISCVJalInstruction} from "../instruction/RISCVJalInstruction";
import {RISCVRetInstruction} from "../instruction/RISCVRetInstruction";
import {RISCVBranchInstruction} from "../instruction/RISCVBranchInstruction";
import {RISCVBranchZInstruction} from "../instruction/RISCVBranchZInstruction";
import {RISCVCompareZInstruction} from "../instruction/RISCVCompareZInstruction";
import {RISCVStoreInstruction} from "../instruction/RISCVStoreInstruction";
import {RISCVLoadInstruction} from "../instruction/RISCVLoadInstruction";
import {RISCVProgram} from "../RISCVProgram";

export class RISCVSynVisitor extends SynNodeVisitor {
    visitRISCVProgram(node: RISCVProgram): void {
    }

    visitDirective(node: RiscVDirective): void {
    }

    visitSectionDirective(node: RISCVSectionDirective): void {
    }

    visitMemoryDirective(node: RISCVMemoryDirective): void {
    }

    visitEquDirective(node: RISCVEquDirective): void {
    }

    visitNumberLiteral(node: RISCVNumberLiteral): void {
    }

    visitStringLiteral(node: RISCVStringLiteral): void {
    }

    visitLabelDeclaration(node: RISCVLabelDeclaration): void {
    }

    visitLabelReference(node: RISCVLabelReference): void {
    }

    visitRegister(node: RISCVRegister): void {
    }

    visitInstruction(node: RISCVInstruction): void {
    }

    visitMoveInstruction(node: RISCVMoveInstruction): void {
    }

    visitLoadImmediateInstruction(node: RISCVLoadImmediateInstruction): void {
    }

    visitLoadAddressInstruction(node: RISCVLoadAddressInstruction): void {
    }

    visitRTypeInstruction(node: RISCVRTypeInstruction): void {
    }

    visitITypeInstruction(node: RISCVITypeInstruction): void {
    }

    visitUnaryInstruction(node: RISCVUnaryInstruction): void {
    }

    visitJumpInstruction(node: RISCVJumpInstruction): void {
    }

    visitJalInstruction(node: RISCVJalInstruction): void {
    }

    visitRetInstruction(node: RISCVRetInstruction): void {
    }

    visitBranchInstruction(node: RISCVBranchInstruction): void {
    }

    visitBranchZInstruction(node: RISCVBranchZInstruction): void {
    }

    visitCompareZInstruction(node: RISCVCompareZInstruction): void {
    }

    visitStoreInstruction(node: RISCVStoreInstruction): void {
    }

    visitLoadInstruction(node: RISCVLoadInstruction): void {
    }
}
