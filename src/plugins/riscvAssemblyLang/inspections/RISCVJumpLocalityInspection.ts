import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import RiscV32Lang from "../lang/RiscvLang";
import {RISCVSynVisitor} from "../lang/syntax/visitor/RISCVSynVisitor";
import {ResolveScope} from "../../../lang/indexes/resolve/ResolveScope";
import {SimpleResolvedReference} from "../../../lang/indexes/resolve/result/SimpleResolvedReference";
import {RISCVLabelDeclaration} from "../lang/syntax/instruction/RISCVLabelDeclaration";
import {RISCVBranchZInstruction} from "../lang/syntax/instruction/RISCVBranchZInstruction";
import {RISCVBranchInstruction} from "../lang/syntax/instruction/RISCVBranchInstruction";
import {RISCVLabelReference} from "../lang/syntax/literal/RISCVLabelReference";
import {RISCVJumpInstruction} from "../lang/syntax/instruction/RISCVJumpInstruction";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export default class RISCVJumpLocalityInspection extends InspectionBase {
    getId(): string {
        return "riscv-assembly.inspections.jumpLocality"
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.WARNING;
    }

    getApplicableLanguages(): LanguageBase[] {
        return [RiscV32Lang.INSTANCE]
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;
        return new class extends RISCVSynVisitor {
            visitBranchInstruction(node: RISCVBranchInstruction) {
                const labelRef = node.getTargetLabel();
                this.validate(node.getEnclosingOfType(RISCVLabelDeclaration), labelRef);
            }

            visitBranchZInstruction(node: RISCVBranchZInstruction) {
                const labelRef = node.getTargetLabel();
                this.validate(node.getEnclosingOfType(RISCVLabelDeclaration), labelRef);
            }

            visitJumpInstruction(node: RISCVJumpInstruction) {
                const labelRef = node.getTargetLabel();
                this.validate(node.getEnclosingOfType(RISCVLabelDeclaration), labelRef);
            }

            validate(nodeLabel: RISCVLabelDeclaration | null, ref?: RISCVLabelReference) {
                if (!ref || !nodeLabel) return;
                const scope = ref.getScope();
                if (!scope) return;
                const resolved = scope.resolve(ref.getName(), ResolveScope.FILE);
                if (!(resolved[0] instanceof SimpleResolvedReference)) return;
                const targetLabel = resolved[0].getNode();
                if (!(targetLabel instanceof RISCVLabelDeclaration)) return;

                if (targetLabel.isProcedureLabel()) {
                    holder.registerProblem(inspection, "Jumping to a procedure label is probably unintentional. Did you mean 'jal'?", ref);
                    return;
                }

                const nodeProcedure = nodeLabel.getParentProcedure();
                const targetProcedure = targetLabel.getParentProcedure();
                if (!nodeProcedure || !targetProcedure) return;

                if (nodeProcedure !== targetProcedure) {
                    holder.registerProblem(inspection, `Non-local jump is probably unintentional, label '${targetLabel.getName()} is outside procedure '${nodeProcedure.getName()}'`, ref);
                }
            }
        };
    }

}
