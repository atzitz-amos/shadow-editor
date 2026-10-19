import {Caret, CaretMovementFlags} from "../../../../editor/core/caret/Caret";
import {IntentBase} from "../../../../lang/codeAnalysis/intents/IntentBase";
import {SynModTree} from "../../../../lang/codeGen/modification/SynModTree";
import {LanguageBase} from "../../../../lang/LanguageBase";
import {SynNode} from "../../../../lang/syntax/api/SynNode";
import JsLang from "../../lang/JsLang";
import {JsNumberLiteral, NumberFormat} from "../../lang/syntax/literal/JsNumberLiteral";
import {Extension} from "../../../../core/plugins/extensionPoints/Extension";

/**
 *
 * @author Atzitz Amos
 * @date 9/29/2026
 * @since 1.0.0
 */
@Extension("intents")
export default class JsConvertNumberToDecimalIntent extends IntentBase {
    getDescription(): string {
        return "Convert number to decimal";
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsNumberLiteral];
    }

    getId(): string {
        throw new Error("Method not implemented.");
    }

    isApplicable(caret: Caret, node: JsNumberLiteral): boolean {
        return node.getValue() !== undefined && node.getNumberFormat() !== NumberFormat.DECIMAL;
    }

    async execute(caret: Caret, node: JsNumberLiteral, synModTree: SynModTree): Promise<void> {
        const decimalValue = node.getNumericValue().toString();
        console.log(decimalValue);
        caret.moveToOffset(node.getTextRange().start + decimalValue.length, CaretMovementFlags.JUMP);
        synModTree.replaceNodeWithText(node, decimalValue);
    }

}
