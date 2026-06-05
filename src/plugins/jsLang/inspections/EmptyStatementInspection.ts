import {InspectionSeverity} from "../../../core/lang/inspections/InspectionSeverity";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import JsLang from "../lang/JsLang";
import {ProblemsHolder} from "../../../core/lang/inspections/problems/ProblemsHolder";
import {SynNodeVisitor} from "../../../core/lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsEmptyStatement} from "../lang/syntax/statements/JsEmptyStatement";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export default class EmptyStatementInspection {
    getId(): string {
        return "javascript.inspections.returnOutsideOfFunction";
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
            visitEmptyStatement(element: JsEmptyStatement) {
                holder.registerProblem(inspection, "Empty statement", element);
            }
        };
    }
}
