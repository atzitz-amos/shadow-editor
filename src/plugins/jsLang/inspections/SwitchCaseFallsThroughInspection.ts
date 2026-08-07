import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import JsLang from "../lang/JsLang";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsSwitchStatement} from "../lang/syntax/statements/JsSwitchStatement";
import {JsReturnStatement} from "../lang/syntax/statements/JsReturnStatement";
import {JsBreakStatement} from "../lang/syntax/statements/JsBreakStatement";
import {QuickFix} from "../../../lang/codeAnalysis/inspections/quickfix/QuickFix";
import {SynModificationTree} from "../../../lang/syntax/writer/template/SynModificationTree";
import {SynASTElement} from "../../../lang/syntax/api/tree/SynASTElement";
import {JsSynTemplate} from "../lang/template/JsSynTemplate";

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
        return [JsLang.INSTANCE];
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;

        return new class extends JsSynVisitor {
            visitSwitchStatement(element: JsSwitchStatement) {
                const body = element.getCaseBodies();
                for (let i = 1; i < body.length - 1; i++) {
                    if (body[i].length > 0) {
                        if (!body[i].some(n => n instanceof JsReturnStatement || n instanceof JsBreakStatement)) {
                            holder.registerProblem(inspection, "Switch case falls through", element.getCases()[i], [new SwitchCaseFallsThroughQuickFix()]);
                        }
                    }
                }
            }
        }
    }
}

class SwitchCaseFallsThroughQuickFix extends QuickFix {
    getId(): string {
        return "javascript.quickFix.switchCaseFallsThrough";
    }

    getDescription(): string {
        return "Add 'break' statement to prevent fall-through";
    }

    applyFix(element: SynASTElement, synModTree: SynModificationTree): void {
        synModTree.insertBefore(element, new JsSynTemplate("break"));
    }
}
