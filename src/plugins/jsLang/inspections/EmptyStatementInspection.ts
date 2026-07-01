import {InspectionSeverity} from "../../../core/lang/inspections/InspectionSeverity";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import JsLang from "../lang/JsLang";
import {ProblemsHolder} from "../../../core/lang/inspections/problems/ProblemsHolder";
import {SynNodeVisitor} from "../../../core/lang/syntax/utils/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsEmptyStatement} from "../lang/syntax/statements/JsEmptyStatement";
import {QuickFix} from "../../../core/lang/inspections/quickfix/QuickFix";
import {SynModificationTree} from "../../../core/lang/syntax/writer/template/SynModificationTree";

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
                holder.registerProblem(inspection, "Empty statement", element, [new class extends QuickFix {
                    getId(): string {
                        throw new Error("Method not implemented.");
                    }

                    getDescription(): string {
                        throw new Error("Method not implemented.");
                    }

                    applyFix(node: JsEmptyStatement, synModTree: SynModificationTree): void {
                        synModTree.removeNode(node);
                    }
                }]);
            }
        };
    }
}

