import {InspectionBase} from "../../../core/lang/inspections/Inspection";
import {InspectionSeverity} from "../../../core/lang/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../core/lang/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../core/lang/LanguageBase";
import {SynNodeVisitor} from "../../../core/lang/syntax/visitors/SynNodeVisitor";
import JsLang from "../lang/JsLang";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsAssignmentExpr} from "../lang/syntax/expr/JsAssignmentExpr";
import {JsDeclarator} from "../lang/syntax/statements/JsDeclarator";
import {QuickFix} from "../../../core/lang/inspections/quickfix/QuickFix";
import {SynModificationTree} from "../../../core/lang/syntax/tree/SynModificationTree";
import {SynSymbol} from "../../../core/lang/syntax/api/SynSymbol";
import {JsVariableDeclaration} from "../lang/syntax/statements/JsVariableDeclaration";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";

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
                        holder.registerProblem(inspection, "Cannot reassign a const variable", identifier, [new ConstVariableReassignedQuickFix()]);
                    }
                }
            }
        }
    }
}

export class ConstVariableReassignedQuickFix extends QuickFix {
    applyFix(element: SynSymbol, synModTree: SynModificationTree): void {
        const decl = element.resolve()?.getParent();
        if (!decl || !(decl instanceof JsVariableDeclaration)) return;
        synModTree.replaceToken(decl, decl.getKindToken(), JsLexicalGrammar.KEYWORD, "let");
    }

    getId(): string {
        return "javascript.quickFix.constVariableReassigned";
    }

    getDescription(): string {
        return "Change variable declaration to 'let'";
    }
}
