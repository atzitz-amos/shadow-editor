import {IntentsHolder} from "../../../lang/codeAnalysis/intents/holder/IntentsHolder";
import {IntentBase} from "../../../lang/codeAnalysis/intents/IntentBase";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNodeVisitor} from "../../../lang/syntax/visitors/SynNodeVisitor";
import JsLang from "../lang/JsLang";

/**
 *
 * @author Atzitz Amos
 * @date 8/31/2026
 * @since 1.0.0
 */
export default class JsCapitalizeStringIntent extends IntentBase {
    getDescription(): string {
        return "Capitalize string literals";
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    getId(): string {
        return "js.capitalizeString";
    }

    buildVisitor(holder: IntentsHolder): SynNodeVisitor {
        const intent = this;

        return new class extends SynNodeVisitor {
            visitStringLiteral(node: any): void {
                const value = node.getValue();
                if (value && value.length > 0) {
                    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
                    holder.addIntent(node, intent, () => {
                    });
                }
            }
        }();
    }

}
