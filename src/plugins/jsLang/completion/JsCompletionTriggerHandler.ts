import {TextRange} from "../../../core/text/range/TextRange";
import {Document} from "../../../editor/core/document/Document";
import {CompletionTriggerHandler} from "../../../lang/codeCompletion/session/trigger/CompletionTriggerHandler";
import {LanguageBase} from "../../../lang/LanguageBase";
import {JsLexicalGrammar} from "../lang/lexer/JsLexicalGrammar";
import JsLang from "../lang/JsLang";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export default class JsCompletionTriggerHandler extends CompletionTriggerHandler {
    /** Whether a string literal has its closing quote, which must not be escaped */
    private static isTerminated(literal: string): boolean {
        if (literal.length < 2 || literal[literal.length - 1] !== literal[0]) return false;

        let backslashes = 0;
        for (let i = literal.length - 2; i > 0 && literal[i] === "\\"; i--) backslashes++;
        return backslashes % 2 === 0;
    }

    public getApplicableLanguages(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    public isCompletionAllowedAt(document: Document, offset: Offset): boolean {
        const token = document.getTokenAt(offset, "left");
        if (token === null) return true;
        if (token.isCommentToken()) return false;

        const type = token.getType();
        if (type !== JsLexicalGrammar.STRING_LITERAL && type !== JsLexicalGrammar.TEMPLATE_STRING && type !== JsLexicalGrammar.REGEX) {
            return true;
        }

        // Right after the closing delimiter is outside of the literal. Only a string can lack one: an unterminated
        // template or regex is not lexed as a single token, so completion still triggers inside of those.
        const range = token.getRange();
        if (offset <= range.start) return true;
        if (offset < range.end) return false;
        return type !== JsLexicalGrammar.STRING_LITERAL || JsCompletionTriggerHandler.isTerminated(token.getValue());
    }

    /** Same class as the tail of the lexer's IDENTIFIER, see {@link JsLexicalGrammar.IDENTIFIER} */
    public isIdentifier(ch: string): boolean {
        return /^[$_\u200C\u200D\p{ID_Continue}]$/u.test(ch);
    }

    public isTriggerCharacter(ch: string): boolean {
        return ch === ".";
    }

    public findCompletionPrefix(document: Document, offset: Offset): TextRange {
        const token = document.getTokenAt(offset, "left");
        if (token === null) return new TextRange(offset, offset);

        const tokenStart = token.getRange().start;

        if (token.getType() === JsLexicalGrammar.IDENTIFIER || token.getType() === JsLexicalGrammar.KEYWORD) {
            // Up to the caret only: the rest of the identifier is not part of the prefix
            return new TextRange(tokenStart, offset);
        }

        return new TextRange(offset, offset);
    }

    public canStartCompletionBefore(document: Document, offset: Offset): boolean {
        const token = document.getTokenAt(offset, "left");
        return !token
            || token.getType() !== JsLexicalGrammar.NUMBER_LITERAL;
    }

}
