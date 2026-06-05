import {InspectionBase} from "../../../core/lang/inspections/Inspection";
import {InspectionSeverity} from "../../../core/lang/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../core/lang/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SynNodeVisitor} from "../../../core/lang/syntax/visitors/SynNodeVisitor";
import JsLang from "../lang/JsLang";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsSwitchStatement} from "../lang/syntax/statements/JsSwitchStatement";
import {JsReturnStatement} from "../lang/syntax/statements/JsReturnStatement";
import {JsBreakStatement} from "../lang/syntax/statements/JsBreakStatement";

/**
 *
 * @author Atzitz Amos
 * @date 6/2/2026
 * @since 1.0.0
 */
export default class SwitchCaseFallsThroughInspection extends InspectionBase {
    getId(): string {
        return "javascript.inspections.switchCaseFallsThrough";
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.WARNING;
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.class];
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;

        return new class extends JsSynVisitor {
            visitSwitchStatement(element: JsSwitchStatement) {
                const body = element.getCaseBodies();
                for (let i = 1; i < body.length - 1; i++) {
                    if (body[i].length > 0) {
                        if (!body[i].some(n => n instanceof JsReturnStatement || n instanceof JsBreakStatement)) {
                            holder.registerProblem(inspection, "Switch case falls through", element.getCases()[i]);
                        }
                    }
                }
            }
        }
    }
}
