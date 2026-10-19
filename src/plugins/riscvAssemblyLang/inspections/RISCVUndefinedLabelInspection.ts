import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import RiscV32Lang from "../lang/RiscvLang";
import {RISCVSynVisitor} from "../lang/syntax/visitor/RISCVSynVisitor";
import {RISCVLabelReference} from "../lang/syntax/literal/RISCVLabelReference";
import {ResolveScope} from "../../../lang/indexes/resolve/ResolveScope";
import {RISCVLabelDeclaration} from "../lang/syntax/instruction/RISCVLabelDeclaration";
import {RISCVJalInstruction} from "../lang/syntax/instruction/RISCVJalInstruction";
import {RISCVBranchInstruction} from "../lang/syntax/instruction/RISCVBranchInstruction";
import {RISCVBranchZInstruction} from "../lang/syntax/instruction/RISCVBranchZInstruction";
import {RISCVJumpInstruction} from "../lang/syntax/instruction/RISCVJumpInstruction";
import {RISCVEquDirective} from "../lang/syntax/directive/RISCVEquDirective";
import {RISCVLoadImmediateInstruction} from "../lang/syntax/instruction/RISCVLoadImmediateInstruction";
import {RISCVITypeInstruction} from "../lang/syntax/instruction/RISCVITypeInstruction";
import {RISCVLoadAddressInstruction} from "../lang/syntax/instruction/RISCVLoadAddressInstruction";
import {SimpleResolvedReference} from "../../../lang/indexes/resolve/result/SimpleResolvedReference";

/**
 *
 * @author Atzitz Amos
 * @date 10/7/2026
 * @since 1.0.0
 */
export default class RISCVUndefinedLabelInspection extends InspectionBase {
    getId(): string {
        return "riscv-assembly.inspections.undefinedLabel"
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.ERROR;
    }

    getApplicableLanguages(): LanguageBase[] {
        return [RiscV32Lang.INSTANCE]
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;

        return new class extends RISCVSynVisitor {
            visitLabelReference(node: RISCVLabelReference) {
                const scope = node.getScope();
                if (!scope) return;
                const resolved = scope.resolve(node.getName(), ResolveScope.FILE);
                if (!(resolved[0] instanceof SimpleResolvedReference)) {
                    console.log(`Undefined label: '${node.getName()}'`);
                    holder.registerProblem(inspection, `Undefined label: '${node.getName()}'`, node);
                } else {
                    const r = resolved[0].getNode();
                    const parent = node.getParent();
                    if (r instanceof RISCVLabelDeclaration &&
                        !(
                            parent instanceof RISCVJalInstruction
                            || parent instanceof RISCVBranchInstruction
                            || parent instanceof RISCVBranchZInstruction
                            || parent instanceof RISCVJumpInstruction
                            || parent instanceof RISCVLoadAddressInstruction
                        )) {
                        holder.registerProblem(inspection, `Label '${node.getName()}' is not a valid target for this instruction`, node);
                    } else if (r instanceof RISCVEquDirective &&
                        !(
                            parent instanceof RISCVLoadImmediateInstruction
                            || parent instanceof RISCVITypeInstruction
                        )) {
                        holder.registerProblem(inspection, `Label '${node.getName()}' is not a valid target for this instruction`, node);
                    }
                }
            }
        }
    }
}
