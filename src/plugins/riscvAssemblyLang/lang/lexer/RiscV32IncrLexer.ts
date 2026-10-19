import {Token} from "../../../../lang/syntax/builder/tokens/Token";
import {RiscV32LexicalGrammar} from "./RiscV32LexicalGrammar";
import {TokenType} from "../../../../lang/syntax/builder/tokens/TokenType";
import {Source} from "../../../../lang/syntax/builder/tokens/TokenStream";
import {IncrementalLexer} from "../../../../lang/syntax/builder/lexer/IncrementalLexer";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";

const isDigit = (c: string | null) => !!c && c >= '0' && c <= '9';
const isIdentStart = (c: string | null) => !!c && /^[A-Za-z_$]$/.test(c);
const isIdentPart = (c: string | null) => !!c && /^[A-Za-z0-9_$.]$/.test(c);
const isWordChar = (c: string | null) => !!c && /^[A-Za-z0-9_$]$/.test(c);

export default class RiscV32IncrLexer extends IncrementalLexer {
    tokenize(input: Source): Token {
        // --- End of input ---
        if (input.isEmpty()) {
            return new Token(TokenType.EOF, "", new TextRange(input.getOffset(), input.getOffset()));
        }

        const start = input.getOffset();
        let ch = input.seek()!;

        // --- Whitespace ---
        if (ch === ' ' || ch === '\t') {
            let value = "";
            while (ch === ' ' || ch === '\t') {
                value += input.consume()!;
                ch = input.seek()!;
            }
            return new Token(RiscV32LexicalGrammar.WHITESPACE, value, input.getRange(start));
        }

        // --- End of line ---
        if (ch === '\n' || ch === '\r') {
            let value = input.consume()!;
            if (ch === '\r' && input.seek() === '\n') {
                value += input.consume()!;
            }
            return new Token(RiscV32LexicalGrammar.EOL, value, input.getRange(start));
        }

        // --- Comments: '#', '//', '/* */' ---
        if (ch === '#' || (ch === '/' && input.seekNext() === '/')) {
            let value = input.consume()!;
            while (!input.isEmpty() && input.seek() !== '\n' && input.seek() !== '\r') {
                value += input.consume();
            }
            return new Token(RiscV32LexicalGrammar.SINGLE_LINE_COMMENT, value, input.getRange(start));
        }
        if (ch === '/' && input.seekNext() === '*') {
            let value = input.consume()! + input.consume()!;
            while (!input.isEmpty()) {
                const c = input.consume()!;
                value += c;
                if (c === '*' && input.seek() === '/') {
                    value += input.consume();
                    break;
                }
            }
            return new Token(RiscV32LexicalGrammar.MULTI_LINE_COMMENT, value, input.getRange(start));
        }

        // --- String literals ---
        if (ch === '"') {
            let value = input.consume()!;
            while (!input.isEmpty()) {
                const c = input.seek()!;
                if (c === '\\') {
                    value += input.consume();
                    if (!input.isEmpty()) value += input.consume();
                    continue;
                }
                if (c === '"') {
                    value += input.consume();
                    break;
                }
                if (c === '\n' || c === '\r') break; // unterminated
                value += input.consume();
            }
            return new Token(RiscV32LexicalGrammar.STRING_LITERAL, value, input.getRange(start));
        }

        // --- Character literals: 'a', '\n' (GNU as also allows an unterminated 'a) ---
        if (ch === "'") {
            let value = input.consume()!;
            if (!input.isEmpty() && input.seek() !== '\n' && input.seek() !== '\r') {
                if (input.seek() === '\\') {
                    value += input.consume();
                    if (!input.isEmpty()) value += input.consume();
                } else {
                    value += input.consume();
                }
                if (input.seek() === "'") value += input.consume();
            }
            return new Token(RiscV32LexicalGrammar.CHAR_LITERAL, value, input.getRange(start));
        }

        // --- Numbers (and numeric local label references like 1f / 1b) ---
        if (isDigit(ch)) {
            return this.parseNumber(ch, input, start);
        }

        // --- Directives (.text, .word, ...) and local labels (.L1) ---
        if (ch === '.' && isIdentStart(input.seekNext())) {
            let value = input.consume()!;
            while (isIdentPart(input.seek())) value += input.consume()!;
            // A name followed directly by ':' is a label definition (.loop:, .L1:)
            if (input.seek() === ':') {
                return new Token(RiscV32LexicalGrammar.LABEL, value, input.getRange(start));
            }
            // GNU convention: '.L' prefix marks an assembler-local label
            const type = value.startsWith(".L") ? RiscV32LexicalGrammar.IDENTIFIER : RiscV32LexicalGrammar.DIRECTIVE;
            return new Token(type, value, input.getRange(start));
        }

        // --- Relocation operators (%hi, %lo, %pcrel_hi, ...) ---
        if (ch === '%' && isIdentStart(input.seekNext())) {
            let value = input.consume()!;
            while (isWordChar(input.seek())) value += input.consume()!;
            return new Token(RiscV32LexicalGrammar.RELOCATION, value, input.getRange(start));
        }

        // --- Symbol attributes (@function, @object) ---
        if (ch === '@' && isIdentStart(input.seekNext())) {
            let value = input.consume()!;
            while (isWordChar(input.seek())) value += input.consume()!;
            return new Token(RiscV32LexicalGrammar.AT_ATTRIBUTE, value, input.getRange(start));
        }

        // --- Words: instructions / registers / CSRs / identifiers ---
        if (isIdentStart(ch)) {
            let value = input.consume()!;
            while (isIdentPart(input.seek())) value += input.consume()!;
            // A word directly followed by ':' is a label definition, even if it
            // is spelled like a mnemonic, register or CSR (e.g. `add:`).
            if (input.seek() === ':') {
                return new Token(RiscV32LexicalGrammar.LABEL, value, input.getRange(start));
            }
            return new Token(this.classifyWord(value), value, input.getRange(start));
        }

        // --- Operators & punctuation ---
        const c1 = input.consume()!;
        const c2 = input.seek() || "";
        const double = c1 + c2;

        switch (c1) {
            case "(":
                return new Token(RiscV32LexicalGrammar.LPAREN, c1, input.getRange(start));
            case ")":
                return new Token(RiscV32LexicalGrammar.RPAREN, c1, input.getRange(start));
            case ",":
                return new Token(RiscV32LexicalGrammar.COMMA, c1, input.getRange(start));
            case ":":
                return new Token(RiscV32LexicalGrammar.COLON, c1, input.getRange(start));
            case ";":
                return new Token(RiscV32LexicalGrammar.SEMICOLON, c1, input.getRange(start));
            case ".":
                return new Token(RiscV32LexicalGrammar.DOT, c1, input.getRange(start));
        }

        switch (double) {
            case "<<":
            case ">>":
                input.jump(1);
                return new Token(RiscV32LexicalGrammar.BITWISE_OPERATOR, double, input.getRange(start));
            case "==":
            case "!=":
            case "<=":
            case ">=":
            case "<>":
                input.jump(1);
                return new Token(RiscV32LexicalGrammar.COMPARISON_OPERATOR, double, input.getRange(start));
            case "&&":
            case "||":
                input.jump(1);
                return new Token(RiscV32LexicalGrammar.LOGICAL_OPERATOR, double, input.getRange(start));
        }

        switch (c1) {
            case "-":
                if (isDigit(input.seek())) {
                    return this.parseNumber(input.consume()!, input, start, c1);
                }
            // fallthrough
            case "+":
            case "*":
            case "/":
            case "%":
                return new Token(RiscV32LexicalGrammar.MATHEMATICAL_OPERATOR, c1, input.getRange(start));
            case "&":
            case "|":
            case "^":
            case "~":
                return new Token(RiscV32LexicalGrammar.BITWISE_OPERATOR, c1, input.getRange(start));
            case "!":
                return new Token(RiscV32LexicalGrammar.LOGICAL_OPERATOR, c1, input.getRange(start));
            case "<":
            case ">":
                return new Token(RiscV32LexicalGrammar.COMPARISON_OPERATOR, c1, input.getRange(start));
            case "=":
                return new Token(RiscV32LexicalGrammar.ASSIGNMENT_OPERATOR, c1, input.getRange(start));
        }

        // --- Fallback ---
        return Token.unexpected(c1, input.getRange(start));
    }

    private parseNumber(ch: string, input: Source, start: number, value = "") {
        let prefixed = false;

        // 1. Explicit base prefixes
        if (ch === '0') {
            value += input.consume()!;
            const p = input.seek();
            const after = input.seekNext() || "";
            if ((p === 'x' || p === 'X') && /^[0-9a-fA-F]$/.test(after)) {
                value += input.consume()!;
                while (/^[0-9a-fA-F]$/.test(input.seek() || "")) value += input.consume()!;
                prefixed = true;
            } else if ((p === 'b' || p === 'B') && /^[01]$/.test(after)) {
                value += input.consume()!;
                while (/^[01]$/.test(input.seek() || "")) value += input.consume()!;
                prefixed = true;
            } else if ((p === 'o' || p === 'O') && /^[0-7]$/.test(after)) {
                value += input.consume()!;
                while (/^[0-7]$/.test(input.seek() || "")) value += input.consume()!;
                prefixed = true;
            }
        }

        if (!prefixed) {
            // 2. Decimal digits
            while (isDigit(input.seek())) value += input.consume()!;

            // 3. Local label reference: digits followed by f/b and not part of a longer word
            const f = input.seek();
            if (value !== "" && (f === 'f' || f === 'F' || f === 'b' || f === 'B')
                && !isWordChar(input.seekNext())) {
                value += input.consume()!;
                return new Token(RiscV32LexicalGrammar.LOCAL_LABEL_REF, value, input.getRange(start));
            }

            // 3b. Numeric local label definition: `1:`
            if (value !== "" && input.seek() === ':') {
                return new Token(RiscV32LexicalGrammar.LABEL, value, input.getRange(start));
            }
        }

        return new Token(RiscV32LexicalGrammar.NUMBER_LITERAL, value, input.getRange(start));
    }

    /**
     * Decides what kind of token a bare word is.
     * Mnemonics and register names are matched case-insensitively.
     */
    private classifyWord(word: string): TokenType {
        const lower = word.toLowerCase();

        if (RiscV32LexicalGrammar.REGISTER_SET.has(lower)) return RiscV32LexicalGrammar.REGISTER;
        if (RiscV32LexicalGrammar.INSTRUCTION_SET.has(lower)) return RiscV32LexicalGrammar.INSTRUCTION;
        if (RiscV32LexicalGrammar.CSR_SET.has(lower)) return RiscV32LexicalGrammar.CSR;

        return RiscV32LexicalGrammar.IDENTIFIER;
    }
}