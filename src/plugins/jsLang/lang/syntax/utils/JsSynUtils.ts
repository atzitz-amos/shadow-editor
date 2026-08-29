import {Token} from "../../../../../lang/syntax/builder/tokens/Token";
import {SynASTElement} from "../../../../../lang/syntax/api/tree/SynASTElement";
import {SynTokenNode} from "../../../../../lang/syntax/impl/SynTokenNode";
import {JsFunctionExpr} from "../expr/JsFunctionExpr";
import {JsArrowFunctionExpr} from "../expr/JsArrowFunctionExpr";
import {JsFunctionStatement} from "../statements/JsFunctionStatement";
import {SynNode} from "../../../../../lang/syntax/api/SynNode";

/**
 *
 * @author Atzitz Amos
 * @date 7/6/2026
 * @since 1.0.0
 */
export class JsSynUtils {
    public static isStringLiteralUnterminated(token: Token) {
        const value = token.getValue();
        if (value.length < 2) {
            return true;
        }
        const quote = value[0];
        return value[value.length - 1] !== quote;
    }

    public static getStringLiteralQuote(token: Token) {
        return token.getValue()[0];
    }

    public static mapSimpleToken(node: SynASTElement, initialIndex: number, tokenNames: string[]): [number, ...(SynTokenNode | undefined)[]] {
        const tokens = node.getAllToken(false);
        const result: [number, ...(SynTokenNode | undefined)[]] = [initialIndex];

        for (let i = 0; i < tokenNames.length; i++) {
            if (tokens[result[0]]?.getValue() === tokenNames[i]) {
                result.push(tokens[result[0]++]);
            } else {
                result.push(undefined);
            }
        }

        return result;
    }

    static isFunction(element: SynNode) {
        return (element instanceof JsFunctionStatement) || (element instanceof JsFunctionExpr) || (element instanceof JsArrowFunctionExpr);
    }
}
