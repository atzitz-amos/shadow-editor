import {LanguageBase} from "../../../lang/LanguageBase";
import {JsBinaryExpr} from "../lang/syntax/expr/JsBinaryExpr";
import {IntentBase} from "../../../lang/codeAnalysis/intents/IntentBase";
import {SynModTree} from "../../../lang/codeGen/modification/SynModTree";
import {SynNode} from "../../../lang/syntax/api/SynNode";
import JsLang from "../lang/JsLang";
import {JsFunctionParameterList} from "../lang/syntax/statements/JsFunctionParameterList";
import {Caret, CaretMovementFlags} from "../../../editor/core/caret/Caret";
import {JsArgumentList} from "../lang/syntax/expr/JsArgumentList";
import {JsBinaryExprTemplate} from "../lang/codeGen/template/expr/JsBinaryExprTemplate";
import {TextRange} from "../../../editor/core/coordinate/range/TextRange";
import {JsFunctionParameterListTemplate} from "../lang/codeGen/template/JsFunctionParameterListTemplate";
import {JsArgumentListTemplate} from "../lang/codeGen/template/JsArgumentListTemplate";

/**
 *
 * @author Atzitz Amos
 * @date 9/27/2026
 * @since 1.0.0
 */
export default class JsSwapOperandsRightIntent extends IntentBase {
    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsBinaryExpr, JsFunctionParameterList, JsArgumentList]
    }

    getId(): string {
        return "js.intent.swapOperandsRight"
    }

    isApplicable(caret: Caret, node: JsBinaryExpr | JsFunctionParameterList | JsArgumentList): boolean {
        if (node instanceof JsBinaryExpr) {
            const sep = node.getOperator().getTextRange().start;
            return caret.getOffset() <= sep;
        } else if (node instanceof JsFunctionParameterList) {
            return node.getParameters().length > 1 && caret.getOffset() < node.getCommas()[node.getCommas().length - 1].getTextRange().end;
        } else {
            return node.getArguments().length > 1 && caret.getOffset() < node.getCommas()[node.getCommas().length - 1].getTextRange().end;
        }
    }

    async execute(caret: Caret, node: JsBinaryExpr | JsFunctionParameterList | JsArgumentList, synModTree: SynModTree): Promise<void> {
        const offset = caret.getOffset();
        if (node instanceof JsBinaryExpr) {
            const length = new TextRange(node.getTextRange().start, node.getRight().getTextRange().start).getLength();
            caret.moveToOffset(caret.getOffset() + length, CaretMovementFlags.JUMP);

            const expr = new JsBinaryExprTemplate(node);
            expr.setLeft(expr.getRight());
            expr.setRight(expr.getLeft());
            synModTree.replaceNode(node, expr);
        } else {
            let index = node.getCommas().length;
            for (let i = 0; i < node.getCommas().length; i++) {
                const comma = node.getCommas()[i];
                if (offset <= comma.getTextRange().start) {
                    index = i;
                    break;
                }
            }
            index += 1; // Move to the right operand/parameter/argument
            if (node instanceof JsFunctionParameterList) {
                const template = new JsFunctionParameterListTemplate(node);
                const params = template.getAllParameters();
                template.replaceParameter(index, params[index - 1]);
                template.replaceParameter(index - 1, params[index]);
                synModTree.replaceNode(node, template);

                caret.moveToOffset(node.getParameters()[index].getTextRange().start, CaretMovementFlags.JUMP);
            } else {
                const template = new JsArgumentListTemplate(node);
                const args = template.getAllArguments();
                template.replaceArgument(index, args[index - 1]);
                template.replaceArgument(index - 1, args[index]);
                synModTree.replaceNode(node, template);

                const length = new TextRange(node.getArguments()[index - 1].getTextRange().start, node.getArguments()[index].getTextRange().start).getLength();
                caret.moveToOffset(node.getArguments()[index].getTextRange().start, CaretMovementFlags.JUMP);
            }
        }
    }

    getDescription(): string {
        return "Swap operands right"
    }
}
