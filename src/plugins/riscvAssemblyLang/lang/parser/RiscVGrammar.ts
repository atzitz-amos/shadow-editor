import {ASTGrammar} from "../../../../lang/syntax/builder/parser/nodes/ASTGrammar";
import {RISCVSectionDirective} from "../syntax/directive/RISCVSectionDirective";
import {RISCVMemoryDirective} from "../syntax/directive/RISCVMemoryDirective";
import {RISCVEquDirective} from "../syntax/directive/RISCVEquDirective";
import {RISCVNumberLiteral} from "../syntax/literal/RISCVNumberLiteral";
import {RISCVStringLiteral} from "../syntax/literal/RISCVStringLiteral";
import {RISCVLabelDeclaration} from "../syntax/instruction/RISCVLabelDeclaration";
import {RISCVLabelReference} from "../syntax/literal/RISCVLabelReference";
import {RISCVRegister} from "../syntax/literal/RISCVRegister";
import {RISCVMoveInstruction} from "../syntax/instruction/RISCVMoveInstruction";
import {RISCVLoadImmediateInstruction} from "../syntax/instruction/RISCVLoadImmediateInstruction";
import {RISCVLoadAddressInstruction} from "../syntax/instruction/RISCVLoadAddressInstruction";
import {RISCVRTypeInstruction} from "../syntax/instruction/RISCVRTypeInstruction";
import {RISCVITypeInstruction} from "../syntax/instruction/RISCVITypeInstruction";
import {RISCVUnaryInstruction} from "../syntax/instruction/RISCVUnaryInstruction";
import {RISCVJumpInstruction} from "../syntax/instruction/RISCVJumpInstruction";
import {RISCVJalInstruction} from "../syntax/instruction/RISCVJalInstruction";
import {RISCVRetInstruction} from "../syntax/instruction/RISCVRetInstruction";
import {RISCVBranchInstruction} from "../syntax/instruction/RISCVBranchInstruction";
import {RISCVBranchZInstruction} from "../syntax/instruction/RISCVBranchZInstruction";
import {RISCVCompareZInstruction} from "../syntax/instruction/RISCVCompareZInstruction";
import {RISCVStoreInstruction} from "../syntax/instruction/RISCVStoreInstruction";
import {RISCVLoadInstruction} from "../syntax/instruction/RISCVLoadInstruction";
import {RISCVProgram} from "../syntax/RISCVProgram";

/**
 *
 * @author Atzitz Amos
 * @date 10/6/2026
 * @since 1.0.0
 */
export class RiscVGrammar {
    public static readonly Program = ASTGrammar.create("Program", RISCVProgram.builder());

    public static readonly SectionDirective = ASTGrammar.create("SectionDirective", RISCVSectionDirective.builder());
    public static readonly MemoryDirective = ASTGrammar.create("MemoryDirective", RISCVMemoryDirective.builder());
    public static readonly EquDirective = ASTGrammar.create("EquDirective", RISCVEquDirective.builder());

    public static readonly NumberLiteral = ASTGrammar.create("NumberLiteral", RISCVNumberLiteral.builder());
    public static readonly StringLiteral = ASTGrammar.create("StringLiteral", RISCVStringLiteral.builder());
    public static readonly LabelDeclaration = ASTGrammar.create("LabelDeclaration", RISCVLabelDeclaration.builder());
    public static readonly LabelReference = ASTGrammar.create("LabelReference", RISCVLabelReference.builder());
    public static readonly Register = ASTGrammar.create("Register", RISCVRegister.builder());

    public static readonly MoveInstruction = ASTGrammar.create("MoveInstruction", RISCVMoveInstruction.builder());
    public static readonly LoadImmediateInstruction = ASTGrammar.create("LoadImmediateInstruction", RISCVLoadImmediateInstruction.builder());
    public static readonly LoadAddressInstruction = ASTGrammar.create("LoadAddressInstruction", RISCVLoadAddressInstruction.builder());
    public static readonly RTypeInstruction = ASTGrammar.create("RTypeInstruction", RISCVRTypeInstruction.builder());
    public static readonly ITypeInstruction = ASTGrammar.create("ITypeInstruction", RISCVITypeInstruction.builder());
    public static readonly UnaryInstruction = ASTGrammar.create("UnaryInstruction", RISCVUnaryInstruction.builder());
    public static readonly JumpInstruction = ASTGrammar.create("JumpInstruction", RISCVJumpInstruction.builder());
    public static readonly JalInstruction = ASTGrammar.create("JalInstruction", RISCVJalInstruction.builder());
    public static readonly RetInstruction = ASTGrammar.create("RetInstruction", RISCVRetInstruction.builder());
    public static readonly BranchInstruction = ASTGrammar.create("BranchInstruction", RISCVBranchInstruction.builder());
    public static readonly BranchZInstruction = ASTGrammar.create("BranchZeroInstruction", RISCVBranchZInstruction.builder());
    public static readonly CompareZInstruction = ASTGrammar.create("CompareZeroInstruction", RISCVCompareZInstruction.builder());
    public static readonly StoreInstruction = ASTGrammar.create("StoreInstruction", RISCVStoreInstruction.builder());
    public static readonly LoadInstruction = ASTGrammar.create("LoadInstruction", RISCVLoadInstruction.builder());
}
