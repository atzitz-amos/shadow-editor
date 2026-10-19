import {HighlighterBase} from "../../../../lang/highlighter/HighlighterBase";
import {Token} from "../../../../lang/syntax/builder/tokens/Token";
import {HighlightHolder} from "../../../../editor/ui/highlighter/HighlightHolder";
import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import {RiscV32LexicalGrammar} from "../lexer/RiscV32LexicalGrammar";
import {TextFontStyleKeys} from "../../../../editor/ui/highlighter/style/TextFontStyle";
import {TokenType} from "../../../../lang/syntax/builder/tokens/TokenType";
import {RiscV32ColorScheme} from "./RiscV32ColorScheme";

export class RiscV32Highlighter extends HighlighterBase {
    public static readonly TEXT_DEFAULT_KEY = TextAttributeKey.of(RiscV32ColorScheme.DEFAULT_COLOR);
    public static readonly TEXT_PUNCTUATION_KEY = TextAttributeKey.of(RiscV32ColorScheme.PUNCTUATION_COLOR);
    public static readonly TEXT_STRING_KEY = TextAttributeKey.of(RiscV32ColorScheme.STRING_COLOR);
    public static readonly TEXT_COMMENT_KEY = TextAttributeKey.of(RiscV32ColorScheme.COMMENT_COLOR, TextFontStyleKeys.ITALIC);
    public static readonly TEXT_NUMBER_KEY = TextAttributeKey.of(RiscV32ColorScheme.NUMBER_COLOR);
    public static readonly TEXT_UNEXPECTED_KEY = TextAttributeKey.of(RiscV32ColorScheme.UNEXPECTED_COLOR, TextFontStyleKeys.BOLD);

    public static readonly TEXT_INSTRUCTION_KEY = TextAttributeKey.of(RiscV32ColorScheme.INSTRUCTION_COLOR);
    public static readonly TEXT_REGISTER_KEY = TextAttributeKey.of(RiscV32ColorScheme.REGISTER_COLOR);
    public static readonly TEXT_CSR_KEY = TextAttributeKey.of(RiscV32ColorScheme.CSR_COLOR);
    public static readonly TEXT_DIRECTIVE_KEY = TextAttributeKey.of(RiscV32ColorScheme.DIRECTIVE_COLOR);
    public static readonly TEXT_LABEL_REF_KEY = TextAttributeKey.of(RiscV32ColorScheme.IDENTIFIER_COLOR, TextFontStyleKeys.UNDERLINE);
    public static readonly TEXT_LABEL_KEY = TextAttributeKey.of(RiscV32ColorScheme.LABEL_COLOR, TextFontStyleKeys.BOLD);

    performHighlighting(holder: HighlightHolder, token: Token): void {
        const type = token.getType();
        const range = token.getRange();

        if (type === RiscV32LexicalGrammar.INSTRUCTION) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_INSTRUCTION_KEY);
        } else if (type === RiscV32LexicalGrammar.REGISTER) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_REGISTER_KEY);
        } else if (type === RiscV32LexicalGrammar.CSR) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_CSR_KEY);
        } else if (type === RiscV32LexicalGrammar.DIRECTIVE || type === RiscV32LexicalGrammar.RELOCATION || type === RiscV32LexicalGrammar.AT_ATTRIBUTE) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_DIRECTIVE_KEY);
        } else if (type === RiscV32LexicalGrammar.LABEL) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_LABEL_KEY);
        } else if (type === RiscV32LexicalGrammar.IDENTIFIER || type === RiscV32LexicalGrammar.LOCAL_LABEL_REF) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_DEFAULT_KEY); // only highlight this with an annotator
        } else if (type === RiscV32LexicalGrammar.STRING_LITERAL || type === RiscV32LexicalGrammar.CHAR_LITERAL) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_STRING_KEY);
        } else if (type === RiscV32LexicalGrammar.NUMBER_LITERAL) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_NUMBER_KEY);
        } else if (type === RiscV32LexicalGrammar.LPAREN || type === RiscV32LexicalGrammar.RPAREN ||
            type === RiscV32LexicalGrammar.COMMA || type === RiscV32LexicalGrammar.COLON ||
            type === RiscV32LexicalGrammar.SEMICOLON || type === RiscV32LexicalGrammar.DOT) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_PUNCTUATION_KEY, [type.debugName, "punctuation"]);
        } else if (token.isCommentToken()) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_COMMENT_KEY);
        } else if (type == TokenType.UNEXPECTED) {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_UNEXPECTED_KEY);
        } else {
            holder.highlightRange(range, RiscV32Highlighter.TEXT_DEFAULT_KEY, [type.debugName]);
        }
    }
}