import {IntentBase} from "../../../lang/codeAnalysis/intents/IntentBase";
import {LanguageBase} from "../../../lang/LanguageBase";
import JsLang from "../lang/JsLang";
import {JsStringLiteral} from "../lang/syntax/literal/JsStringLiteral";
import {SynNode} from "../../../lang/syntax/api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 8/31/2026
 * @since 1.0.0
 */
export default class JsCapitalizeStringIntent extends IntentBase {
    isApplicable(node: SynNode): boolean {
        return true;
    }

    execute(node: SynNode): void {
        if (node instanceof JsStringLiteral) {
            const value = node.getValue();
            console.log(value);
        }
    }

    getDescription(): string {
        return "Capitalize string literals";
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    getId(): string {
        return "js.capitalizeString";
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsStringLiteral];
    }
}
