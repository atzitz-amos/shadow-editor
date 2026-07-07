/**
 *
 * @author Atzitz Amos
 * @date 7/5/2026
 * @since 1.0.0
 */
export class JsSmartActionsUtils {
    public static readonly INVALID_TRAILING_CHARS = /^\w$/;

    public static readonly AUTOCLOSEABLES = {
        '"': '"',
        "'": "'",
        "[": "]",
        "(": ")",
        "{": "}"
    };

    public static closing(char: string): string {
        return JsSmartActionsUtils.AUTOCLOSEABLES[char] ?? '';
    }

    public static isValidTrailingChar(char: string) {
        return !this.INVALID_TRAILING_CHARS.test(char);
    }

    public static hasClosing(char: string | null) {
        return char !== null && JsSmartActionsUtils.AUTOCLOSEABLES[char] !== undefined;
    }

    static isQuote(char: string | null) {
        return char === '"' || char === "'";
    }
}

