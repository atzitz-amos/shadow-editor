import {InspectionBase} from "../../../core/lang/inspections/Inspection";
import {ProblemsHolder} from "../../../core/lang/inspections/problems/ProblemsHolder";
import {SynNodeVisitor} from "../../../core/lang/syntax/visitors/SynNodeVisitor";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {InspectionSeverity} from "../../../core/lang/inspections/InspectionSeverity";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import JsLang from "../lang/JsLang";
import {SynErrorNode} from "../../../core/lang/syntax/impl/SynErrorNode";
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
        return [JsLang.class];
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
