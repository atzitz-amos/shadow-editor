import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import HTMLLang from "../lang/HTMLLang";
import {HtmlSynVisitor} from "../lang/syntax/visitor/HtmlSynVisitor";
import {SynErrorNode} from "../../../lang/syntax/impl/SynErrorNode";

/**
 *
 * @author Atzitz Amos
 * @date 9/23/2026
 * @since 1.0.0
 */
export default class HtmlSemanticAnalysisInspection extends InspectionBase {
    getId(): string {
        return "html.inspections.semanticAnalysis"
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.ERROR;
    }

    getApplicableLanguages(): LanguageBase[] {
        return [HTMLLang.INSTANCE];
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;

        return new class extends HtmlSynVisitor {
            visitError(error: SynErrorNode) {
                holder.registerProblem(inspection, error.getErrorMessage(), error);
            }
        }
    }

}
