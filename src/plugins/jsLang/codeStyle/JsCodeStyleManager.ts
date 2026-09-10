import {CodeStyleManager} from "../../../lang/codeStyle/manager/CodeStyleManager";
import {SpacingFormatter} from "../../../lang/codeStyle/spacing/SpacingFormatter";
import {TokenType} from "../../../lang/syntax/builder/tokens/TokenType";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import {JsSpacingRules} from "./spacing/JsSpacingRules";
import {JsFormattingBlockVisitor} from "./blocks/JsFormattingBlockVisitor";
import {FormattingBlockVisitor} from "../../../lang/codeStyle/formatter/builder/FormattingBlockVisitor";
import {FormattingEngineBase} from "../../../lang/codeStyle/formatter/engine/FormattingEngineBase";
import {SimpleLayoutFormattingEngine} from "../../../lang/codeStyle/formatter/engine/SimpleLayoutFormattingEngine";
import {Token} from "../../../lang/syntax/builder/tokens/Token";

/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export class JsCodeStyleManager extends CodeStyleManager {
    private static instance: JsCodeStyleManager | null = null;

    public static getInstance() {
        if (!this.instance)
            this.instance = new JsCodeStyleManager();
        return this.instance;
    }

    public getIndentationSize(): number {
        return 4;
    }

    public getWhitespaceTokenGroup(): TokenType[] {
        return [JsLexicalGrammar.WHITESPACE];
    }

    public getNewlineTokenGroup(): TokenType[] {
        return [JsLexicalGrammar.EOL];
    }

    public getSpacingFormatter(): SpacingFormatter {
        return SpacingFormatter.make(this, JsSpacingRules);
    }

    public getFormattingBlockVisitor(): FormattingBlockVisitor {
        return new JsFormattingBlockVisitor();
    }

    public getFormattingEngine(): FormattingEngineBase {
        return new class extends SimpleLayoutFormattingEngine {

            // Matches the lexer's identifier continuation class exactly: /[$\w]/.
            // (Identifiers here are ASCII-only — no unicode ID_Continue support.)
            private static readonly WORD_CHAR = /[$\w]/;

            // Chars that form a *different* token when doubled, per JsIncrLexer's
            // switch(double): ++ -- ** == && || ?? << >>
            // '.' stays in defensively so three adjacent DOT tokens can't
            // re-lex as ELLIPSIS ("...").
            private static readonly MERGE_ON_REPEAT = new Set([
                "+", "-", "*", "/", "=", "&", "|", "?", ".", "<", ">"
            ]);

            // Any of these chars immediately followed by '=' forms a distinct
            // compound token per switch(double): += -= *= /= %= &= |= ^= != <= >=
            private static readonly ASSIGN_LEADING = new Set([
                "+", "-", "*", "/", "%", "&", "|", "^", "!", "<", ">"
            ]);

            needsSpaceBetween(token1: Token, token2: Token): boolean {
                const v1 = token1?.getValue();
                const v2 = token2?.getValue();
                if (!v1 || !v2) {
                    return false;
                }

                const last = v1[v1.length - 1];
                const first = v2[0];

                if (this.isWordChar(last) && this.isWordChar(first)) {
                    return true;
                }

                if (last === first && (this.constructor as any).MERGE_ON_REPEAT.has(last)) {
                    return true;
                }

                if (first === "=" && (this.constructor as any).ASSIGN_LEADING.has(last)) {
                    return true;
                }

                if (last === "=" && first === ">") {
                    return true;
                }

                if (last === "/" && first === "*") {
                    return true;
                }

                if (last === "?" && first === ".") {
                    return true;
                }

                return /[0-9]/.test(last) && first === ".";
            }

            private isWordChar(ch: string): boolean {
                return ch.length > 0 && (this.constructor as any).WORD_CHAR.test(ch);
            }

        }(this);
    }
}
