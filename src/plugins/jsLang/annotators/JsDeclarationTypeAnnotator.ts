import {AnnotatorBase} from "../../../lang/codeAnalysis/annotators/AnnotatorBase";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import {HighlightHolder} from "../../../editor/ui/highlighter/HighlightHolder";
import {JsSynVisitor} from "../lang/syntax/visitors/JsSynVisitor";
import JsLang from "../lang/JsLang";
import {JsClassMethod} from "../lang/syntax/objects/JsClassMethod";
import {JsPrivatePropertyName} from "../lang/syntax/objects/JsClassPropertyKey";
import {JsHighlighter} from "../lang/highlighter/JsHighlighter";
import {JsIdentifier} from "../lang/syntax/literal/JsIdentifier";
import {JsFunction} from "../lang/syntax/api/JsFunction";
import {JsDeclarator} from "../lang/syntax/statements/JsDeclarator";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export default class JsDeclarationTypeAnnotator extends AnnotatorBase {
    buildVisitor(holder: HighlightHolder): SynNodeVisitor {
        return new class extends JsSynVisitor {
            visitClassMethod(element: JsClassMethod) {
                const name = element.getName();
                if (name instanceof JsPrivatePropertyName || name instanceof JsIdentifier) {
                    holder.highlightRange(name.getTextRange(), JsHighlighter.TEXT_FUNCTION_KEY);
                }
            }

            visitFunction(element: JsFunction) {
                const name = element.getNameToken();
                if (name) holder.highlightRange(name.getTextRange(), JsHighlighter.TEXT_FUNCTION_KEY);
            }

            visitDeclarator(element: JsDeclarator) {

            }
        };
    }


    getId(): string {
        return "javascript.annotators.declarationTypeAnnotator"
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }
}
