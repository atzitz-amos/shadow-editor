/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {HighlighterBase} from "../../../../core/lang/highlighter/HighlighterBase";
import {Token} from "../../../../core/lang/syntax/builder/tokens/Token";
import {HighlightHolder} from "../../../../editor/ui/highlighter/HighlightHolder";
import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import {JsColorScheme} from "./JsColorScheme";
import {JsLexicalGrammar} from "../lexer/JsLexicalGrammar";
import {TextFontStyleKeys} from "../../../../editor/ui/highlighter/style/TextFontStyle";

export class JsHighlighter extends HighlighterBase {
    public static readonly TEXT_DEFAULT_KEY = TextAttributeKey.of(JsColorScheme.DEFAULT_COLOR);
    public static readonly TEXT_KEYWORD_KEY = TextAttributeKey.of(JsColorScheme.KEYWORD_COLOR);
    public static readonly TEXT_STRING_KEY = TextAttributeKey.of(JsColorScheme.STRING_COLOR);
    public static readonly TEXT_COMMENT_KEY = TextAttributeKey.of(JsColorScheme.COMMENT_COLOR, TextFontStyleKeys.ITALIC);
    public static readonly TEXT_NUMBER_KEY = TextAttributeKey.of(JsColorScheme.NUMBER_COLOR);
    public static readonly TEXT_PUNCTUATION_KEY = TextAttributeKey.of(JsColorScheme.PUNCTUATION_COLOR);

    performHighlighting(holder: HighlightHolder, token: Token): void {
        const type = token.getType();

        if (type === JsLexicalGrammar.KEYWORD) {
            holder.highlightRange(token.getRange(), JsHighlighter.TEXT_KEYWORD_KEY);
        } else if (type === JsLexicalGrammar.STRING_LITERAL || type === JsLexicalGrammar.TEMPLATE_STRING) {
            holder.highlightRange(token.getRange(), JsHighlighter.TEXT_STRING_KEY);
        } else if (type === JsLexicalGrammar.NUMBER_LITERAL) {
            holder.highlightRange(token.getRange(), JsHighlighter.TEXT_NUMBER_KEY);
        } else if (type === JsLexicalGrammar.LPAREN || type === JsLexicalGrammar.RPAREN ||
            type === JsLexicalGrammar.LBRACE || type === JsLexicalGrammar.RBRACE ||
            type === JsLexicalGrammar.LBRACKET || type === JsLexicalGrammar.RBRACKET ||
            type === JsLexicalGrammar.SEMICOLON) {
            holder.highlightRange(token.getRange(), JsHighlighter.TEXT_PUNCTUATION_KEY, [type.debugName, "punctuation"]);
        } else if (token.isCommentToken()) {
            holder.highlightRange(token.getRange(), JsHighlighter.TEXT_COMMENT_KEY);
        } else {
            holder.highlightRange(token.getRange(), JsHighlighter.TEXT_DEFAULT_KEY, [type.debugName]);
        }
    }
}