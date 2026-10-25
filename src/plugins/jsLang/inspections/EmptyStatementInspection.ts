import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {LanguageBase} from "../../../lang/LanguageBase";
import JsLang from "../lang/JsLang";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsEmptyStatement} from "../lang/syntax/statements/JsEmptyStatement";
import {QuickFix} from "../../../lang/codeAnalysis/inspections/quickfix/QuickFix";
import {SynModificationTree} from "../../../lang/syntax/writer/template/SynModificationTree";
import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {JsCodeBlock} from "../lang/syntax/JsCodeBlock";

/**
 *
 * @author Atzitz Amos
 * @date 6/5/2026
 * @since 1.0.0
 */
export default class EmptyStatementInspection extends InspectionBase {
    getId(): string {
        return "javascript.inspections.emptyStatement";
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
            visitEmptyStatement(element: JsEmptyStatement) {
                const parent = element.getParent();
                if (parent instanceof JsCodeBlock && parent.isImplicit() && parent.getElementChildren().length === 1) return;

                holder.registerProblem(inspection, "Empty statement", element, [new class extends QuickFix {
                    getId(): string {
                        return "javascript.quickFix.removeEmptyStatement"
                    }

                    getDescription(): string {
                        return "Remove empty statement";
                    }

                    applyFix(node: JsEmptyStatement, synModTree: SynModificationTree): void {
                        synModTree.removeNode(node);
                    }
                }]);
            }
        };
    }
}
