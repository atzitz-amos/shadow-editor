import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import {LanguageBase} from "../../../lang/LanguageBase";
import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import JsLang from "../lang/JsLang";
import {SynErrorNode} from "../../../lang/syntax/impl/SynErrorNode";
import {JsForInStatement} from "../lang/syntax/statements/JsForInStatement";
import {JsForIStatement} from "../lang/syntax/statements/JsForIStatement";

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
        return [JsLang.INSTANCE];
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.ERROR;
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;

        return new class extends JsSynVisitor {
            visitError(error: SynErrorNode) {
                holder.registerProblem(inspection, "Syntax error: " + error.getErrorMessage(), error);
            }

            visitForInStatement(element: JsForInStatement) {
                if (element.getAllToken()[1]?.getValue() === "await") {
                    holder.registerProblem(inspection, "Syntax error: 'await' is not allowed in for-in statement", element.getAllToken()[1]);
                }
            }

            visitForIStatement(element: JsForIStatement) {
                if (element.getAllToken()[1]?.getValue() === "await") {
                    holder.registerProblem(inspection, "Syntax error: 'await' is not allowed in regular for statement", element.getAllToken()[1]);
                }
            }
        };
    }

}
