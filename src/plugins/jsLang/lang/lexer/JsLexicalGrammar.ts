import {LexicalGrammar} from "../../../../editor/lang/lexer/LexicalGrammar";
import {TokenType} from "../../../../editor/lang/tokens/TokenType";
import {JsLang} from "../JsLang";


const LexicalBuilder = TokenType.createLanguageBuilder(JsLang.class);

export class JsLexicalGrammar implements LexicalGrammar {
    /**
     * Skippable token for end-of-line characters (\r\n, \n, \r).
     */
    public static readonly EOL = LexicalBuilder.makeSkippable("EOL", /\r\n|\n|\r/);

    /**
     * Skippable token for whitespace (spaces and tabs).
     */
    public static readonly WHITESPACE = LexicalBuilder.makeSkippable("WHITESPACE", /[ \t]+/);

    /**
     * Token for single-line comments (// ...).
     */
    public static readonly SINGLE_LINE_COMMENT = LexicalBuilder.makeComment("SINGLE_LINE_COMMENT", /\/\/.*/);

    /**
     * Token for multi-line comments (/* ... *\/).
     */
    public static readonly MULTI_LINE_COMMENT = LexicalBuilder.makeComment("MULTI_LINE_COMMENT", /\/\*[\s\S]*?\*\//);

    /**
     * Token for JavaScript keywords.
     */
    public static readonly KEYWORD = LexicalBuilder.make("KEYWORD", /\b(?:break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|null|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|async|await)\b/);

    /**
     * Token for valid JavaScript identifiers.
     */
    public static readonly IDENTIFIER = LexicalBuilder.make("IDENTIFIER", /[a-zA-Z_$][a-zA-Z0-9_$]*/);

    /**
     * Token for number literals (decimal, hex, binary, octal, scientific).
     */
    public static readonly NUMBER_LITERAL = LexicalBuilder.make("NUMBER_LITERAL", /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);

    /**
     * Token for string literals (single, double, template).
     */
    public static readonly STRING_LITERAL = LexicalBuilder.make("STRING_LITERAL", /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/);

    /**
     * Token for template strings (backtick-delimited).
     */
    public static readonly TEMPLATE_STRING = LexicalBuilder.make("TEMPLATE_STRING", /`(?:\\.|[^`\\])*`/);

    /**
     * Token for regular expression literals.
     */
    public static readonly REGEX = LexicalBuilder.make("REGEX", /\/(?!\s)(?:\\.|[^\/\\\n])+\/[gimsuy]*/);

    /**
     * Matches logical operators: &&, ||, ??, !
     */
    public static readonly LOGICAL_OPERATOR = LexicalBuilder.make("LOGICAL_OPERATOR", /&&|\|\||\?\?|!/);

    /**
     * Matches comparison operators: ==, ===, !=, !==, <, <=, >, >=
     */
    public static readonly COMPARISON_OPERATOR = LexicalBuilder.make("COMPARISON_OPERATOR", /===|!==|==|!=|<=|>=|<|>/);

    /**
     * Matches postfix operators: ++, --
     */
    public static readonly POSTFIX_OPERATOR = LexicalBuilder.make("POSTFIX_OPERATOR", /\+\+|--/);

    /**
     * Matches assignment operators: =, +=, -=, *=, /=, %=, &=, |=, ^=, &&=, ||=, <<=, >>=, >>>=, **=, ??=
     */
    public static readonly ASSIGNMENT_OPERATOR = LexicalBuilder.make("ASSIGNMENT", /=|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|&&=|\|\|=|<<=|>>=|>>>=|\*\*=|\?\?=/);

    /**
     * Matches mathematical operators: +, -, *, /, %, **
     */
    public static readonly MATHEMATICAL_OPERATOR = LexicalBuilder.make("MATHEMATICAL_OPERATOR", /\*\*|[+\-*/%]/);

    /**
     * Matches bitwise operators: &, |, ^, ~, <, >
     */
    public static readonly BITWISE_OPERATOR = LexicalBuilder.make("BITWISE_OPERATOR", /[&|^~<>]/);

    /**
     * Token for left parenthesis '('.
     */
    public static readonly LPAREN = LexicalBuilder.make("LPAREN", /\(/);
    /**
     * Token for right parenthesis ')'.
     */
    public static readonly RPAREN = LexicalBuilder.make("RPAREN", /\)/);
    /**
     * Token for left brace '{'.
     */
    public static readonly LBRACE = LexicalBuilder.make("LBRACE", /\{/);
    /**
     * Token for right brace '}'.
     */
    public static readonly RBRACE = LexicalBuilder.make("RBRACE", /}/);
    /**
     * Token for left bracket '['.
     */
    public static readonly LBRACKET = LexicalBuilder.make("LBRACKET", /\[/);
    /**
     * Token for right bracket ']'.
     */
    public static readonly RBRACKET = LexicalBuilder.make("RBRACKET", /]/);
    /**
     * Token for semicolon ';'.
     */
    public static readonly SEMICOLON = LexicalBuilder.make("SEMICOLON", /;/);
    /**
     * Token for comma ','.
     */
    public static readonly COMMA = LexicalBuilder.make("COMMA", /,/);
    /**
     * Token for ellipsis '...'.
     */
    public static readonly ELLIPSIS = LexicalBuilder.make("SPREAD", /\.{3}/);
    /**
     * Token for colon ':'.
     */
    public static readonly COLON = LexicalBuilder.make("COLON", /:/);
    /**
     * Token for dot '.' or '?.'
     */
    public static readonly DOT = LexicalBuilder.make("DOT", /\.|\?\./);
    /**
     * Token for question mark '?'.
     */
    public static readonly QUESTION_MARK = LexicalBuilder.make("QUESTION_MARK", /\?/);
    /**
     * Token for arrow '=>'.
     */
    public static readonly ARROW = LexicalBuilder.make("ARROW", /=>/);
    /**
     * Token for end of file.
     */
    public static readonly EOF = LexicalBuilder.make("EOF", /$/);
}