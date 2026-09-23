import {Token} from "../../../../lang/syntax/builder/tokens/Token";
import {Source} from "../../../../lang/syntax/builder/tokens/TokenStream";
import {TokenType} from "../../../../lang/syntax/builder/tokens/TokenType";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";
import {HtmlLexicalGrammar} from "./HtmlLexicalGrammar";
import {StatefulLexer} from "../../../../lang/syntax/builder/lexer/StatefulLexer";
import {LexerState} from "../../../../lang/syntax/builder/lexer/stateful/LexerState";

/**
 *
 * @author Atzitz Amos
 * @date 9/17/2026
 * @since 1.0.0
 */
export class HtmlStatefulLexer extends StatefulLexer {
    private static readonly IN_TAG_HEADER = LexerState.create("IN_TAG");
    private static readonly IN_TAG_ATTRIBUTE_VALUE = LexerState.create("IN_TAG_ATTRIBUTE_VALUE");
    private static readonly TAG_OPEN_NAME = LexerState.create("TAG_OPEN_NAME");
    private static readonly TAG_CLOSE_NAME = LexerState.create("TAG_CLOSE_NAME");
    private static readonly OUTER_LANGUAGE_TAG = LexerState.create("OUTER_LANGUAGE_TAG");

    // ---- Entry point: dispatch purely on current state ----------------------------------

    tokenize(input: Source, state: LexerState): Token {
        if (input.isEmpty()) {
            return new Token(TokenType.EOF, "", new TextRange(input.getOffset(), input.getOffset()));
        }

        if (state.isToplevel(HtmlStatefulLexer.OUTER_LANGUAGE_TAG)) return this.lexOuterLanguage(input, state);
        if (state.is(HtmlStatefulLexer.TAG_OPEN_NAME)) return this.lexTagOpenName(input, state);
        if (state.is(HtmlStatefulLexer.TAG_CLOSE_NAME)) return this.lexTagCloseName(input, state);
        if (state.is(HtmlStatefulLexer.IN_TAG_ATTRIBUTE_VALUE)) return this.lexInTagAttributeValue(input, state);
        if (state.is(HtmlStatefulLexer.IN_TAG_HEADER)) return this.lexInTagHeader(input, state);
        return this.lexDefault(input, state);
    }

    // ---- Per-state handlers ---------------------------------------------------------------

    /** Inside <script>...</script> or <style>...</style>: consume raw text until the closing tag. */
    private lexOuterLanguage(input: Source, state: LexerState): Token {
        const start = input.getOffset();
        const data = state.exit()!.getData();

        const value = this.consumeWhile(input, () => !input.startsWith(`</${data}>`));

        const type = data === "script" ? HtmlLexicalGrammar.SCRIPT_CONTENT
            : data === "style" ? HtmlLexicalGrammar.STYLE_CONTENT
                : TokenType.UNEXPECTED;

        return new Token(type, value, input.getRange(start));
    }

    /** Right after '<': expects a tag name, then transitions into IN_TAG_HEADER. */
    private lexTagOpenName(input: Source, state: LexerState): Token {
        const start = input.getOffset();
        const ch = input.seek()!;

        if (/[a-zA-Z]/.test(ch)) {
            const value = this.consumeIdentifier(input);
            state.exit();
            state.enter(HtmlStatefulLexer.IN_TAG_HEADER, value);
            return new Token(HtmlLexicalGrammar.TAG_NAME, value, input.getRange(start));
        }

        // Malformed markup (e.g. "< foo>"): bail out of the tag state instead of getting stuck.
        state.exit();
        return this.lexDefault(input, state);
    }

    /** Right after '</': expects a tag name, then pops back to the default state. */
    private lexTagCloseName(input: Source, state: LexerState): Token {
        const start = input.getOffset();
        const ch = input.seek()!;

        if (/[a-zA-Z]/.test(ch)) {
            const value = this.consumeIdentifier(input);
            state.exit();
            return new Token(HtmlLexicalGrammar.TAG_NAME, value, input.getRange(start));
        }

        state.exit();
        return this.lexDefault(input, state);
    }

    /** Inside "<tag ...": attribute names, '=', quoted values, and the closing '>'. */
    private lexInTagHeader(input: Source, state: LexerState): Token {
        const start = input.getOffset();
        const ch = input.seek()!;

        if (ch === ' ' || ch === '\t') return this.lexWhitespace(input);
        if (ch === '\n' || ch === '\r') return this.lexEol(input);
        if (ch === '=') {
            input.consume();
            state.enter(HtmlStatefulLexer.IN_TAG_ATTRIBUTE_VALUE);
            return new Token(HtmlLexicalGrammar.EQUALS, "=", input.getRange(start));
        }
        if (ch === '"' || ch === "'") return this.lexQuotedString(input);

        if (ch === '/' && input.seekNext() === '>') {
            input.consume(); // '/'
            input.consume(); // '>'
            state.exit();
            return new Token(HtmlLexicalGrammar.TAG_SLASH_CLOSE_BRACKET, "/>", input.getRange(start));
        }

        if (ch === '>') {
            input.consume();
            const data = state.exit()!.getData(); // leave IN_TAG_HEADER
            if (data === "script" || data === "style") {
                state.enter(HtmlStatefulLexer.OUTER_LANGUAGE_TAG, data);
            }
            return new Token(HtmlLexicalGrammar.TAG_CLOSE_BRACKET, ">", input.getRange(start));
        }

        if (/[a-zA-Z]/.test(ch)) {
            const value = this.consumeIdentifier(input);
            return new Token(HtmlLexicalGrammar.TAG_ATTRIBUTE_NAME, value, input.getRange(start));
        }

        input.consume();
        return Token.unexpected(ch, input.getRange(start));
    }

    /** Outside any tag: plain text, '<' / '</' openers, comments, entities, EOL/whitespace. */
    private lexDefault(input: Source, state: LexerState): Token {
        const start = input.getOffset();
        const ch = input.seek()!;

        if (ch === ' ' || ch === '\t') return this.lexWhitespace(input);
        if (ch === '\n' || ch === '\r') return this.lexEol(input);
        if (ch === '&') return this.lexEntity(input);
        if (ch === '<') return this.lexLessThan(input, state);
        if (ch === '/' && input.seekNext() === '>') {
            input.consume(); // '/'
            input.consume(); // '>'
            return new Token(HtmlLexicalGrammar.TAG_SLASH_CLOSE_BRACKET, "/>", input.getRange(start));
        }

        if (ch === '>') {
            input.consume();
            return new Token(HtmlLexicalGrammar.TAG_CLOSE_BRACKET, ">", input.getRange(start));
        }

        if (/[a-zA-Z]/.test(ch)) {
            const value = this.consumeIdentifier(input);
            return new Token(HtmlLexicalGrammar.TEXT, value, input.getRange(start));
        }
        input.consume();
        return Token.unexpected(ch, input.getRange(start));
    }

    // ---- '<' handling: tag open / close / comment / literal text --------------------------

    private lexLessThan(input: Source, state: LexerState): Token {
        const start = input.getOffset();
        const nextCh = input.seekNext();

        if (nextCh === '/') {
            state.enter(HtmlStatefulLexer.TAG_CLOSE_NAME);
            input.consume(); // '<'
            input.consume(); // '/'
            return new Token(HtmlLexicalGrammar.TAG_SLASH_OPEN_BRACKET, "</", input.getRange(start));
        }

        if (nextCh === '!') {
            return this.lexBangTag(input, start);
        }

        if (nextCh !== null && /[a-zA-Z]/.test(nextCh)) {
            state.enter(HtmlStatefulLexer.TAG_OPEN_NAME);
            input.consume(); // '<'
            return new Token(HtmlLexicalGrammar.TAG_OPEN_BRACKET, "<", input.getRange(start));
        }

        // '<' not followed by a letter (space, digit, punctuation, EOF, ...) -> literal text.
        input.consume();
        return new Token(HtmlLexicalGrammar.TEXT, "<", input.getRange(start));
    }

    /** Handles "<!--...-->" comments, and "<!" that turns out not to be a comment. */
    private lexBangTag(input: Source, start: number): Token {
        input.consume(); // '<'
        input.consume(); // '!'

        if (input.seek() === '-' && input.seekNext() === '-') {
            input.consume(); // '-'
            input.consume(); // '-'
            const value = this.consumeWhile(input, () =>
                !(input.seek() === '-' && input.seekNext() === '-' && input.seek2() === '>')
            );
            if (!input.isEmpty()) {
                input.consume(); // '-'
                input.consume(); // '-'
                input.consume(); // '>'
            }
            return new Token(HtmlLexicalGrammar.COMMENT, value, input.getRange(start));
        }

        // e.g. "<!DOCTYPE": '<' and '!' are already consumed; emit them as text
        // rather than falling through unreturned.
        return new Token(HtmlLexicalGrammar.TEXT, "<!", input.getRange(start));
    }

    // ---- Shared token scanners --------------------------------------------------------------

    private lexWhitespace(input: Source): Token {
        const start = input.getOffset();
        const value = this.consumeWhile(input, ch => ch === ' ' || ch === '\t');
        return new Token(HtmlLexicalGrammar.WHITESPACE, value, input.getRange(start));
    }

    private lexEol(input: Source): Token {
        const start = input.getOffset();
        const first = input.consume()!;
        let value = first;
        if (first === '\r' && input.seek() === '\n') {
            value += input.consume()!; // \r\n
        }
        return new Token(HtmlLexicalGrammar.EOL, value, input.getRange(start));
    }

    private lexQuotedString(input: Source): Token {
        const start = input.getOffset();
        const quoteType = input.seek()!;
        const chars: string[] = [input.consume()!]; // opening quote

        while (true) {
            const ch = input.seek();
            if (ch === null) break; // unterminated string at EOF
            chars.push(input.consume()!);
            if (ch === quoteType) break; // closing quote
        }

        return new Token(HtmlLexicalGrammar.STRING, chars.join(""), input.getRange(start));
    }

    private lexInTagAttributeValue(input: Source, state: LexerState) {
        const start = input.getOffset();
        if (input.seek() === '"' || input.seek() === "'") {
            const token = this.lexQuotedString(input);
            state.exit(); // leave IN_TAG_ATTRIBUTE_VALUE
            return token;
        }

        // Unquoted attribute value: consume until whitespace, '>', or EOF.
        const value = this.consumeWhile(input, ch => !/[\s>]/.test(ch));
        state.exit(); // leave IN_TAG_ATTRIBUTE_VALUE
        return new Token(HtmlLexicalGrammar.STRING, value, input.getRange(start));
    }

    private lexEntity(input: Source): Token {
        const start = input.getOffset();
        const chars: string[] = [input.consume()!]; // '&' — kept in the token value

        while (input.seek() && /[a-zA-Z0-9#]/.test(input.seek()!)) {
            chars.push(input.consume()!);
        }
        if (input.seek() === ';') {
            chars.push(input.consume()!);
        }

        return new Token(HtmlLexicalGrammar.HTML_ENTITY, chars.join(""), input.getRange(start));
    }

    /** Tag/attribute names: letters, digits, ':' and '-'. Caller already confirmed a leading letter. */
    private consumeIdentifier(input: Source): string {
        return input.consume()! + this.consumeWhile(input, ch => /[a-zA-Z0-9:-]/.test(ch));
    }

    /** Consumes characters while `pred` holds for the *next* char, stopping cleanly at EOF. */
    private consumeWhile(input: Source, pred: (ch: string) => boolean): string {
        const chars: string[] = [];
        while (!input.isEmpty() && pred(input.seek()!)) {
            chars.push(input.consume()!);
        }
        return chars.join("");
    }
}