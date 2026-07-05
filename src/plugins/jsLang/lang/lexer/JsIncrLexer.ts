/*
 * Author: Atzitz Amos
 * Date: 10/18/2025
 */

import {IncrementalLexer} from "../../../../core/lang/syntax/builder/lexer/IncrementalLexer";
import {Token} from "../../../../core/lang/syntax/builder/tokens/Token";
import {Source} from "../../../../core/lang/syntax/builder/tokens/TokenStream";
import {JsLexicalGrammar} from "./JsLexicalGrammar";
import {TokenType} from "../../../../core/lang/syntax/builder/tokens/TokenType";
import {TextRange} from "../../../../editor/core/coordinate/range/TextRange";

export default class JsIncrLexer extends IncrementalLexer {
    tokenize(input: Source): Token {
        // If at end of input
        if (input.isEmpty()) {
            return new Token(TokenType.EOF, "", new TextRange(input.getOffset(), input.getOffset()));
        }

        const start = input.getOffset();
        let ch = input.seek()!;

        // --- Whitespace ---
        if (ch === ' ' || ch === '\t') {
            const valueArr: string[] = [];
            while (ch === ' ' || ch === '\t') {
                valueArr.push(input.consume()!);
                ch = input.seek()!;
            }
            const value = valueArr.join("");
            return new Token(JsLexicalGrammar.WHITESPACE, value, input.getRange(start));
        }

        // --- End of line ---
        if (ch === '\n' || ch === '\r') {
            let value = input.consume()!;
            // Handle Windows-style \r\n
            if (ch === '\r' && input.seek() === '\n') {
                value += input.consume()!;
            }
            return new Token(JsLexicalGrammar.EOL, value, input.getRange(start));
        }

        // --- Comments ---
        if (ch === '/') {
            const next = input.seekNext();
            if (next === '/') {
                // single line comment
                let value = input.consume()! + input.consume()!;
                while (!input.isEmpty() && input.seek() !== '\n' && input.seek() !== '\r') {
                    value += input.consume();
                }
                return new Token(JsLexicalGrammar.SINGLE_LINE_COMMENT, value, input.getRange(start));
            }
            if (next === '*') {
                // multi-line comment
                let value = input.consume()! + input.consume()!;
                while (!input.isEmpty()) {
                    const c = input.consume()!;
                    value += c;
                    if (c === '*' && input.seek() === '/') {
                        value += input.consume();
                        break;
                    }
                }
                return new Token(JsLexicalGrammar.MULTI_LINE_COMMENT, value, input.getRange(start));
            }
        }

        // --- String literals ---
        if (ch === '"' || ch === "'" || ch === '`') {
            const quote = input.consume()!;
            let value = quote;
            while (!input.isEmpty()) {
                let c = input.seek()!;
                if (c === '\\') {
                    // escape next character
                    value += input.consume();
                    value += input.consume();
                    continue;
                } else if (c === quote) {
                    value += input.consume();
                    break;
                } else if (c === "\n" || c === "\r") {
                    if (quote !== '`') break;
                }

                value += input.consume();
            }
            const type =
                quote === '`'
                    ? JsLexicalGrammar.TEMPLATE_STRING
                    : JsLexicalGrammar.STRING_LITERAL;
            return new Token(type, value, input.getRange(start));
        }

        // --- Numbers ---
        const isDigit = /^[0-9]$/.test(ch);
        const isDotNumber = ch === '.' && /^[0-9]$/.test(input.seekNext() || "");

        if (isDigit || isDotNumber) {
            let value = "";

            // 1. Check for explicit base prefixes (0x, 0b, 0o)
            if (ch === '0') {
                const next = input.seekNext();
                if (next === 'x' || next === 'X') {
                    value += input.consume()! + input.consume()!; // 0x
                    while (/^[0-9a-fA-F_]$/.test(input.seek() || "")) value += input.consume()!;
                } else if (next === 'b' || next === 'B') {
                    value += input.consume()! + input.consume()!; // 0b
                    while (/^[01_]$/.test(input.seek() || "")) value += input.consume()!;
                } else if (next === 'o' || next === 'O') {
                    value += input.consume()! + input.consume()!; // 0o
                    while (/^[0-7_]$/.test(input.seek() || "")) value += input.consume()!;
                }
            }

            // 2. If it wasn't a special base, parse as decimal (or legacy octal)
            if (value === "") {
                // Integer part
                while (/^[0-9_]$/.test(input.seek() || "")) {
                    value += input.consume()!;
                }

                // Fractional part
                if (input.seek() === '.') {
                    value += input.consume()!; // consume '.'
                    while (/^[0-9_]$/.test(input.seek() || "")) {
                        value += input.consume()!;
                    }
                }

                // Exponent part
                const exp = input.seek();
                if (exp === 'e' || exp === 'E') {
                    value += input.consume()!; // consume 'e' or 'E'
                    const sign = input.seek();
                    if (sign === '+' || sign === '-') {
                        value += input.consume()!; // consume sign
                    }
                    while (/^[0-9_]$/.test(input.seek() || "")) {
                        value += input.consume()!;
                    }
                }
            }

            // 3. BigInt suffix (valid for any base prefix)
            if (input.seek() === 'n') {
                value += input.consume()!;
            }

            return new Token(JsLexicalGrammar.NUMBER_LITERAL, value, input.getRange(start));
        }

        // --- Identifiers / Keywords ---
        if (/[$A-Za-z_]/.test(ch)) {
            let value = input.consume()!;
            while (/[$\w]/.test(input.seek() || "")) {
                value += input.consume();
            }

            const isKeyword = JsLexicalGrammar.KEYWORD_LIST.has(value);
            const type = isKeyword
                ? JsLexicalGrammar.KEYWORD
                : JsLexicalGrammar.IDENTIFIER;
            return new Token(type, value, input.getRange(start));
        }

        // --- Operators & punctuation ---
        let c1 = input.consume()!;
        let c2 = input.seek() || "";
        let c3 = input.seekNext() || "";
        let triple = c1 + c2 + c3;
        let double = c1 + c2;

        // ELLIPSIS
        if (triple === "...") {
            input.jump(2);
            return new Token(JsLexicalGrammar.ELLIPSIS, "...", input.getRange(start));
        }

        // ===
        if (triple === "===" || triple === "!==") {
            input.jump(2);
            return new Token(JsLexicalGrammar.COMPARISON_OPERATOR, triple, input.getRange(start));
        }

        // DOT
        if (c1 === ".") {
            return new Token(JsLexicalGrammar.DOT, c1, input.getRange(start));
        }

        // Single-character tokens (brackets, etc.)
        const singleMap: Record<string, TokenType> = {
            "(": JsLexicalGrammar.LPAREN,
            ")": JsLexicalGrammar.RPAREN,
            "{": JsLexicalGrammar.LBRACE,
            "}": JsLexicalGrammar.RBRACE,
            "[": JsLexicalGrammar.LBRACKET,
            "]": JsLexicalGrammar.RBRACKET,
            ";": JsLexicalGrammar.SEMICOLON,
            ",": JsLexicalGrammar.COMMA,
            ":": JsLexicalGrammar.COLON,
            "#": JsLexicalGrammar.HASHTAG
        };
        if (singleMap[c1]) {
            return new Token(singleMap[c1], c1, input.getRange(start));
        }

        switch (double) {
            case "++":
            case "--":
                input.jump(1);
                return new Token(JsLexicalGrammar.POSTFIX_OPERATOR, double, input.getRange(start));
            case "=>":
                input.jump(1);
                return new Token(JsLexicalGrammar.ARROW, "=>", input.getRange(start));
            case "==":
            case ">=":
            case "!=":
            case "<=":
                input.jump(1);
                return new Token(JsLexicalGrammar.COMPARISON_OPERATOR, double, input.getRange(start));
            case "+=":
            case "-=":
            case "*=":
            case "/=":
            case "%=":
            case "&=":
            case "|=":
            case "^=":
                input.jump(1);
                return new Token(JsLexicalGrammar.ASSIGNMENT_OPERATOR, double, input.getRange(start));
            case "&&":
            case "||":
            case "??":
                input.jump(1);
                if (c3 === "=") {
                    input.jump(1);
                    return new Token(JsLexicalGrammar.ASSIGNMENT_OPERATOR, triple, input.getRange(start));
                }
                return new Token(JsLexicalGrammar.LOGICAL_OPERATOR, double, input.getRange(start));
            case ">>":
            case "<<":
                input.jump(1);
                if (triple === ">>>") {
                    input.jump(1);
                    double += ">";
                    c3 = input.seek() || "";
                }
                if (c3 === "=") {
                    input.jump(1);
                    return new Token(JsLexicalGrammar.ASSIGNMENT_OPERATOR, double + "=", input.getRange(start));
                }
                return new Token(JsLexicalGrammar.BITWISE_OPERATOR, double, input.getRange(start));
            case "**":
                input.jump(1);
                return new Token(JsLexicalGrammar.MATHEMATICAL_OPERATOR, double, input.getRange(start));
            case "?.":
                input.jump(1);
                return new Token(JsLexicalGrammar.DOT, double, input.getRange(start));
        }

        switch (c1) {
            case "+":
            case "-":
            case "*":
            case "/":
            case "%":
                return new Token(JsLexicalGrammar.MATHEMATICAL_OPERATOR, c1, input.getRange(start));
            case "&":
            case "|":
            case "^":
            case "~":
                return new Token(JsLexicalGrammar.BITWISE_OPERATOR, c1, input.getRange(start));
            case "=":
                return new Token(JsLexicalGrammar.ASSIGNMENT_OPERATOR, c1, input.getRange(start));
            case "!":
                return new Token(JsLexicalGrammar.LOGICAL_OPERATOR, c1, input.getRange(start));
            case "<":
            case ">":
                return new Token(JsLexicalGrammar.COMPARISON_OPERATOR, c1, input.getRange(start));
            case "?":
                return new Token(JsLexicalGrammar.QUESTION_MARK, c1, input.getRange(start));

        }

        // --- Fallback operator token ---
        return Token.unexpected(c1, TextRange.around(input.getOffset()));
    }
}