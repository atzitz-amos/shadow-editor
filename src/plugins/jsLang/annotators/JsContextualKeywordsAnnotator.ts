import {AnnotatorBase} from "../../../lang/codeAnalysis/annotators/AnnotatorBase";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import JsLang from "../lang/JsLang";
import {JsFunction} from "../lang/syntax/api/JsFunction";
import {JsHighlighter} from "../lang/highlighter/JsHighlighter";
import {JsAwaitExpr} from "../lang/syntax/expr/JsAwaitExpr";
import {JsForOfStatement} from "../lang/syntax/statements/JsForOfStatement";

/**
 *
 * @author Atzitz Amos
 * @date 8/4/2026
 * @since 1.0.0
 */
export default class JsContextualKeywordsAnnotator extends AnnotatorBase {
    buildVisitor(holder: HighlightHolder): SynNodeVisitor {
        return new class extends JsSynVisitor {
            visitFunction(element: JsFunction) {
                const asyncToken = element.getAsyncToken();
                if (asyncToken) {
                    holder.highlightRange(asyncToken.getTextRange(), JsHighlighter.TEXT_KEYWORD_KEY);
                }
            }

            visitAwaitExpr(element: JsAwaitExpr) {
                holder.highlightRange(element.getAwaitToken().getTextRange(), JsHighlighter.TEXT_KEYWORD_KEY);
            }

            visitForOfStatement(element: JsForOfStatement) {
                holder.highlightRange(element.getOfToken().getTextRange(), JsHighlighter.TEXT_KEYWORD_KEY);

                if (element.getAwaitToken() !== undefined) {
                    holder.highlightRange(element.getAwaitToken()!.getTextRange(), JsHighlighter.TEXT_KEYWORD_KEY);
                }
            }
        };
    }

    getId(): string {
        return "javascript.annotators.functionNameAnnotator"
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }
}