import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {LanguageBase} from "../../../lang/LanguageBase";
import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import RiscV32Lang from "../lang/RiscvLang";
import {SynErrorNode} from "../../../lang/syntax/impl/SynErrorNode";
import {RISCVSynVisitor} from "../lang/syntax/visitor/RISCVSynVisitor";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export default class SemanticAnalysisInspection extends InspectionBase {
    getId(): string {
        return "javascript.inspections.semanticAnalysis";
    }

    getApplicableLanguages(): LanguageBase[] {
        return [RiscV32Lang.INSTANCE];
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.ERROR;
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;

        return new class extends RISCVSynVisitor {
            visitError(error: SynErrorNode) {
                holder.registerProblem(inspection, "Syntax error: " + error.getErrorMessage(), error);
            }
        }
    }

}
