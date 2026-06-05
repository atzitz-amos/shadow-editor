import {InspectionBase} from "../../../core/lang/inspections/Inspection";
import {InspectionSeverity} from "../../../core/lang/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../core/lang/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SynNodeVisitor} from "../../../core/lang/syntax/visitors/SynNodeVisitor";
import JsLang from "../lang/JsLang";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsAssignmentExpr} from "../lang/syntax/expr/JsAssignmentExpr";
import {JsIdentifier} from "../lang/syntax/literal/JsIdentifier";
import {JsDeclarator} from "../lang/syntax/statements/JsDeclarator";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export default class ConstVariableReassignedInspection extends InspectionBase {
    getId(): string {
        return "javascript.inspections.constVariableReassigned";
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.ERROR;
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class];
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;

        return new class extends JsSynVisitor {
            visitAssignmentExpr(element: JsAssignmentExpr) {
                for (const identifier of element.getAllModifiedIdentifiers()) {
                    let decl = identifier.resolve();
                    if (decl && decl instanceof JsDeclarator && decl.isConst()) {
                        holder.registerProblem(inspection, "Cannot reassign a const variable", identifier);
                    }
                }
            }
        }
    }

}
