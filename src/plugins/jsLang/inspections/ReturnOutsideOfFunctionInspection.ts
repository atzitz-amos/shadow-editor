import {InspectionBase} from "../../../core/lang/inspections/Inspection";
import {InspectionSeverity} from "../../../core/lang/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../core/lang/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SynNodeVisitor} from "../../../core/lang/syntax/visitors/SynNodeVisitor";
import JsLang from "../lang/JsLang";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsReturnStatement} from "../lang/syntax/statements/JsReturnStatement";
import {SynScopeType} from "../../../core/lang/syntax/builder/parser/scopes/SynScopeType";

/**
 *
 * @author Atzitz Amos
 * @date 6/2/2026
 * @since 1.0.0
 */
export default class ReturnOutsideOfFunctionInspection extends InspectionBase {
    getId(): string {
        return "javascript.inspections.returnOutsideOfFunction";
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
            visitReturnStatement(element: JsReturnStatement): void {
                let scope = element.getParentScope();

                while (scope.getType() !== SynScopeType.Global) {
                    if (scope.getType() === SynScopeType.Function) {
                        return;
                    }
                    scope = scope.getParent();
                }

                holder.registerProblem(inspection, "Return statement outside of function body", element);
            }
        };
    }
}
