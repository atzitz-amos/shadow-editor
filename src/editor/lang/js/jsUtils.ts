import {JSSrNode} from "./jsNodes";
import {JS} from "./jsLexer";
import {ErrorToken, Token} from "../../core/lang/lexer/TokenStream";

export class JSParsingUtils {
    static tokenToHumanReadableString(token: Token<JS> | null): string {
        if (!token) return "#undef";
        if (token.isError) {
            return `#${token.type}<${(token as ErrorToken<JS>).msg}>`;
        }
        return token.value;
    }

    static toHumanReadableString(nd: JSSrNode | null | undefined): string {
        if (!nd) {
            return "#undef";
        }
        return nd.toHumanReadableString();
    }

    static isValidToken(token: Token<JS> | null | undefined): boolean {
        return !!token && !token.isError && !token.isSpecial;
    }
}


export class JsPrecedenceUtils {
    static precedenceMap: Record<string, number> = {
        '**': 15,
        '*': 14,
        '/': 14,
        '+': 13,
        '-': 13,
        '<<': 12,
        '>>': 12,
        '>>>': 12,
    };

    static isRightAssociative(op: string): boolean {
        return op === '**';
    }

    static getPrecedence(value: string): number {
        return JsPrecedenceUtils.precedenceMap[value];
    }
}