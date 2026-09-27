import {IntentBase} from "../../../lang/codeAnalysis/intents/IntentBase";
import {SynModTree} from "../../../lang/codeGen/modification/SynModTree";
import {LanguageBase} from "../../../lang/LanguageBase";
import {SynNode} from "../../../lang/syntax/api/SynNode";
import JsLang from "../lang/JsLang";
import {JsStringLiteral} from "../lang/syntax/literal/JsStringLiteral";
import {Caret} from "../../../editor/core/caret/Caret";

/**
 *
 * @author Atzitz Amos
 * @date 9/27/2026
 * @since 1.0.0
 */
export default class JsStringUppercaseIntent extends IntentBase {

    getDescription(): string {
        return "Convert string to uppercase";
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE]
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsStringLiteral]
    }

    getId(): string {
        return "js.intent.stringUppercase"
    }

    isApplicable(caret: Caret, node: JsStringLiteral): boolean {
        return node.getValue() !== null && node.getValue()!.toUpperCase() !== node.getValue()!;
    }

    async execute(caret: Caret, node: JsStringLiteral, synModTree: SynModTree): Promise<void> {
        const value = node.getValue();
        if (!value) return;
        synModTree.replaceNodeWithText(node, value.toUpperCase());
    }
}
