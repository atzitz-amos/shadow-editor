import {ILexer} from "../../core/lang/lexer/ILexer";
import {ErrorToken, LazyTokenStream, Source, Token, TokenStream} from "../../core/lang/lexer/TokenStream";
import {TextRange} from "../../core/Position";

export enum JS {
    Keyword = "Keyword",
    Identifier = "Identifier",
    Number = "Number",
    String = "String",  // TODO
    Punctuation = "Punctuation",
    LPAREN = "LeftParen",
    RPAREN = "RightParen",
    LBRACE = "LeftBrace",
    RBrace = "RightBrace",
    LBRACKET = "LeftBracket",
    RBRACKET = "RightBracket",
    Operator = "Operator",
    UnOperator = "UnOperator",
    IncrDecrOp = "IncrDecrOp",  // e.g. "++", "--"
    Equals = "Equals",
    EqualOp = "EqualOp",  // e.g. "+=", "-=", "*=", "/="
    CompareOp = "CompareOp",  // e.g. "==", "!=", "<", ">", "<=", ">="
    Arrow = "Arrow",
    EOL = "EOL",
    EOF = "EOF",
    SyntaxError = "SyntaxError",
}


export class JSLexer implements ILexer<JS> {
    static readonly KEYWORDS: string[] = [
        "var",
        "let",
        "const",
        "if",
        "else",
        "switch",
        "case",
        "default",
        "for",
        "while",
        "do",
        "break",
        "continue",
        "return",
        "try",
        "catch",
        "finally",
        "throw",
        "function",
        "class",
        "extends",
        "super",
        "this",
        "new",
        "await",
        "async",
        "yield",
        "yield*",
        "in",
        "instanceof",
        "delete",
        "typeof",
        "void",
        "debugger",
        "import",
        "export",
        "abstract",
        "arguments",
        "boolean",
        "byte",
        "char",
        "double",
        "enum",
        "final",
        "float",
        "goto",
        "implements",
        "int",
        "interface",
        "long",
        "native",
        "package",
        "private",
        "protected",
        "public",
        "short",
        "static",
        "synchronized",
        "throws",
        "transient",
        "volatile"
    ];

    asTokenStream(input: string): TokenStream<JS> {
        return new LazyTokenStream(this, input);
    }

    tokenize(src: Source): Token<JS> {
        if (src.followupError) {
            return src.clearError() as Token<JS>;
        }

        while (true) {
            if (src.isEmpty()) return new Token(JS.EOF, "EOF", new TextRange(src.index, src.index));
            let char = src.consume() as string;
            if (char === "\n") {
                return new Token(JS.EOL, "\n", TextRange.around(src.index - 1), true)
            } else if (char === " ") {
            } else if (char >= '0' && char <= '9') {
                let num = char;
                while (!src.isEmpty() && src.seek()! >= '0' && src.seek()! <= '9') {
                    num += src.consume();
                }
                return new Token(JS.Number, num, new TextRange(src.index - num.length, src.index));
            } else if (this.isAlphanumeric(char)) {
                let identifier = char;
                while (!src.isEmpty() && this.isAlphanumeric(src.seek()!)) {
                    identifier += src.consume();
                }
                if (JSLexer.KEYWORDS.includes(identifier)) {
                    return new Token(JS.Keyword, identifier, new TextRange(src.index - identifier.length, src.index));
                }
                return new Token(JS.Identifier, identifier, new TextRange(src.index - identifier.length, src.index));
            } else if (char === "(") {
                return new Token(JS.LPAREN, "(", TextRange.around(src.index - 1));
            } else if (char === ")") {
                return new Token(JS.RPAREN, ")", TextRange.around(src.index - 1));
            } else if (char === "{") {
                return new Token(JS.LBRACE, "{", TextRange.around(src.index - 1));
            } else if (char === "}") {
                return new Token(JS.RBrace, "}", TextRange.around(src.index - 1));
            } else if (char === "[") {
                return new Token(JS.LBRACKET, "[", TextRange.around(src.index - 1));
            } else if (char === "]") {
                return new Token(JS.RBRACKET, "]", TextRange.around(src.index - 1));
            } else if (char === ".") {
                if (src.seek() === "." && src.seekNext() === ".") {
                    src.consume(); // consume the second dot
                    src.consume(); // consume the third dot
                    return new Token(JS.Punctuation, "...", new TextRange(src.index - 3, src.index));
                }
                return new Token(JS.Punctuation, ".", TextRange.around(src.index - 1));
            } else if (char === "," || char === ";" || char === ":") {
                return new Token(JS.Punctuation, char, TextRange.around(src.index - 1));
            } else if (char === "=") {
                if (src.seek() === "=") {
                    src.consume(); // consume the second '='
                    if (src.seek() === "=") {
                        src.consume(); // consume the third '='
                        return new Token(JS.CompareOp, "===", new TextRange(src.index - 3, src.index));
                    }
                    return new Token(JS.CompareOp, "==", new TextRange(src.index - 2, src.index));
                } else if (src.seek() === ">") {
                    src.consume(); // consume the '>'
                    return new Token(JS.Arrow, "=>", new TextRange(src.index - 2, src.index));
                }
                return new Token(JS.Equals, "=", TextRange.around(src.index - 1));
            } else if (char == "+" || char === "-" || char === "*" || char === "/") {
                if (src.seek() === "=") {
                    src.consume(); // consume the '='
                    return new Token(JS.EqualOp, char + "=", new TextRange(src.index - 2, src.index));
                } else if (char === src.seek()) {
                    src.consume();
                    return (char === "+" || char === "-") ? new Token(JS.IncrDecrOp, char + char, new TextRange(src.index - 2, src.index))
                        : new Token(JS.Operator, char + char, TextRange.around(src.index - 2));
                }
                return new Token(JS.Operator, char, TextRange.around(src.index - 1));
            } else if (char === ">" || char === "<") {
                if (src.seek() === "=") {
                    src.consume(); // consume the '='
                    return new Token(JS.CompareOp, char + "=", new TextRange(src.index - 2, src.index));
                } else if (src.seek() === char) {
                    src.consume();
                    if (char === ">" && src.seek() === ">") {
                        src.consume(); // consume the third '>'
                        return new Token(JS.Operator, ">>>", new TextRange(src.index - 3, src.index));
                    }
                    return new Token(JS.Operator, char + char, new TextRange(src.index - 2, src.index));
                }
                return new Token(JS.CompareOp, char, TextRange.around(src.index - 1));
            } else if (char === "|" || char === "&" || char === "?" || char === "^") {
                if (src.seek() === "=") {
                    return new Token(JS.EqualOp, char + "=", TextRange.around(src.index - 2));
                } else if (src.seek() === char && char !== "^") {
                    src.consume();
                    return new Token(JS.Operator, char + char, new TextRange(src.index - 2, src.index));
                } else if (char !== "?") {
                    return new Token(JS.Operator, char, TextRange.around(src.index - 1));
                }
                return new Token(JS.Punctuation, "?", TextRange.around(src.index - 1));
            } else if (char === "!" || char === "~") {
                return new Token(JS.UnOperator, char, TextRange.around(src.index - 1));
            } else if (char === "'" || char === '"') {
                let str = char;
                while (!src.isEmpty() && src.seek() !== char && src.seek() !== "\n") {
                    str += src.consume();
                }
                if (src.seek() === char) {
                    str += src.consume(); // consume the closing quote
                    return new Token(JS.String, str, new TextRange(src.index - str.length, src.index));
                } else {
                    src.followupError = new ErrorToken(JS.SyntaxError, str[str.length - 1], "Unterminated string literal", TextRange.around(src.index - 1));
                    return new Token(JS.String, str, new TextRange(src.index - str.length, src.index));
                }

            } else {
                return new ErrorToken(JS.SyntaxError, char, "Unexpected char: " + char, TextRange.around(src.index - 1));
            }
        }
    }

    private isAlphanumeric(char: string) {
        return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z' || char === '_' || char === '$';
    }
}