import {AnnotatorBase} from "../../../lang/codeAnalysis/annotators/AnnotatorBase";
import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import {JsHighlighter} from "../lang/highlighter/JsHighlighter";
import {LanguageBase} from "../../../lang/LanguageBase";
import JsLang from "../lang/JsLang";
import {JsMemberAccessExpr} from "../lang/syntax/expr/JsMemberAccessExpr";
import {JsCallExpr} from "../lang/syntax/expr/JsCallExpr";
import {JsIdentifier} from "../lang/syntax/literal/JsIdentifier";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export default class JsFunctionCallsAnnotator extends AnnotatorBase {
    buildVisitor(holder: HighlightHolder): SynNodeVisitor {
        return new class extends JsSynVisitor {
            visitMemberAccessExpr(element: JsMemberAccessExpr) {
                const parent = element.getParent();
                if (!element.getProperty()) return;

                if (parent instanceof JsCallExpr) {
                    holder.highlightRange(element.getProperty().getTextRange(), JsHighlighter.TEXT_FUNCTION_KEY);
                } else {
                    holder.highlightRange(element.getProperty().getTextRange(), JsHighlighter.TEXT_VARIABLE_KEY);
                }
            }

            visitCallExpr(element: JsCallExpr) {
                if (element.getCallee() instanceof JsIdentifier) {
                    holder.highlightRange(element.getCallee().getTextRange(), JsHighlighter.TEXT_FUNCTION_KEY);
                }
            }
        };
    }


    getId(): string {
        return "javascript.annotators.functionCalls"
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

}