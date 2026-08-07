import {InspectionBase} from "../../../lang/codeAnalysis/inspections/Inspection";
import {InspectionSeverity} from "../../../lang/codeAnalysis/inspections/InspectionSeverity";
import {ProblemsHolder} from "../../../lang/codeAnalysis/inspections/problems/ProblemsHolder";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import JsLang from "../lang/JsLang";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsAssignmentExpr} from "../lang/syntax/expr/JsAssignmentExpr";
import {JsDeclarator} from "../lang/syntax/statements/JsDeclarator";
import {QuickFix} from "../../../lang/codeAnalysis/inspections/quickfix/QuickFix";
import {SynModificationTree} from "../../../lang/syntax/writer/template/SynModificationTree";
import {SynSymbol} from "../../../lang/syntax/impl/reference/SynSymbol";
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
        return [JsLang.INSTANCE];
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
