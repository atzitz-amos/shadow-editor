import {Token} from "../../../../../core/lang/syntax/builder/tokens/Token";

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
}
