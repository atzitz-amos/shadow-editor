/*
 * Author: Atzitz Amos
 * Date: 10/18/2025
 */

import {IncrementalLexer} from "../../../../core/lang/lexer/IncrementalLexer";
import {Token} from "../../../../core/lang/tokens/Token";
import {Source} from "../../../../core/lang/tokens/TokenStream";
import {JsLexicalGrammar} from "./JsLexicalGrammar";
import {TokenType} from "../../../../core/lang/tokens/TokenType";
import {TextRange} from "../../../../editor/core/coordinate/TextRange";

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
                const c = input.consume()!;
                value += c;
                if (c === '\\') {
                    // escape next character
                    value += input.consume() || "";  // should fail if escape char at end of input
                } else if (c === quote) {
                    break;
                } else if (c === "\n" || c === "\r") {
                    if (quote !== '`') break;
                }
            }
            const type =
                quote === '`'
                    ? JsLexicalGrammar.TEMPLATE_STRING
                    : JsLexicalGrammar.STRING_LITERAL;
            return new Token(type, value, input.getRange(start));
        }

        // --- Numbers ---
        if (/[0-9.]/.test(ch)) {
            const textLeft = input.getRemaining();

            const match = textLeft.match(JsLexicalGrammar.NUMBER_REGEX);
            if (match) {
                const value = match[0];
                input.jump(value.length);
                return new Token(JsLexicalGrammar.NUMBER_LITERAL, value, input.getRange(start));
            }
        }

        // --- Identifiers / Keywords ---
        if (/[$A-Za-z_]/.test(ch)) {
            let value = input.consume()!;
            while (/[$\w]/.test(input.seek() || "")) {
                value += input.consume();
            }

            const isKeyword = JsLexicalGrammar.KEYWORD_LIST.includes(value);
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

        // DOT or ?.
        if (c1 === ".") {
            if (c2 === "?") {
                c1 += "?";
                input.jump(1);
            }
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
            "?": JsLexicalGrammar.QUESTION_MARK,
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
        }

        switch (c1) {
            case "+":
            case "-":
            case "*":
            case "/":
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

        }

        // --- Fallback operator token ---
        return Token.unexpected(c1, TextRange.around(input.getOffset()));
    }
}
