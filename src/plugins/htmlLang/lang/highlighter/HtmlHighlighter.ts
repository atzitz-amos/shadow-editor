import {TextAttributeKey} from "../../../../editor/ui/highlighter/style/TextAttributeKey";
import {HtmlColorScheme} from "./HtmlColorScheme";
import {HighlighterBase} from "../../../../lang/highlighter/HighlighterBase";
import {HighlightHolder} from "../../../../editor/ui/highlighter/HighlightHolder";
import {Token} from "../../../../lang/syntax/builder/tokens/Token";
import {HtmlLexicalGrammar} from "../lexer/HtmlLexicalGrammar";
import {TextFontStyleKeys} from "../../../../editor/ui/highlighter/style/TextFontStyle";
import {HtmlStatefulLexer} from "../lexer/HtmlStatefulLexer";

/**
 *
 * @author Atzitz Amos
 * @date 9/17/2026
 * @since 1.0.0
 */
export class HtmlHighlighter extends HighlighterBase {
    public static readonly TEXT_DEFAULT_KEY = TextAttributeKey.of(HtmlColorScheme.DEFAULT_COLOR);

    public static readonly TEXT_TAG_KEY = TextAttributeKey.of(HtmlColorScheme.TAG_BRACKET_COLOR);
    public static readonly TEXT_TAG_ATTRIBUTE_KEY = TextAttributeKey.of(HtmlColorScheme.TAG_ATTRIBUTE_COLOR);
    public static readonly TEXT_TAG_NAME_KEY = TextAttributeKey.of(HtmlColorScheme.TAG_NAME_COLOR);

    public static readonly TEXT_STRING_KEY = TextAttributeKey.of(HtmlColorScheme.STRING_COLOR);
    public static readonly TEXT_HTML_ENTITY_KEY = TextAttributeKey.of(HtmlColorScheme.HTML_ENTITY_COLOR, TextFontStyleKeys.ITALIC);
    public static readonly TEXT_COMMENT_KEY = TextAttributeKey.of(HtmlColorScheme.COMMENT_COLOR);

    public static readonly TEXT_OUTER_LANGUAGE_KEY = TextAttributeKey.of(HtmlColorScheme.OUTER_LANGUAGE_COLOR, TextFontStyleKeys.ITALIC);

    performHighlighting(holder: HighlightHolder, token: Token): void {
        switch (token.getType()) {
            case HtmlLexicalGrammar.TAG_OPEN_BRACKET:
            case HtmlLexicalGrammar.TAG_CLOSE_BRACKET:
            case HtmlLexicalGrammar.TAG_SLASH_OPEN_BRACKET:
            case HtmlLexicalGrammar.TAG_SLASH_CLOSE_BRACKET:
                holder.highlightRange(token.getRange(), HtmlHighlighter.TEXT_TAG_KEY);
                break;
            case HtmlLexicalGrammar.TAG_NAME:
                holder.highlightRange(token.getRange(), HtmlHighlighter.TEXT_TAG_NAME_KEY);
                break;
            case HtmlLexicalGrammar.TAG_ATTRIBUTE_NAME:
                holder.highlightRange(token.getRange(), HtmlHighlighter.TEXT_TAG_ATTRIBUTE_KEY);
                break;
            case HtmlLexicalGrammar.STRING:
                holder.highlightRange(token.getRange(), HtmlHighlighter.TEXT_STRING_KEY);
                break;
            case HtmlLexicalGrammar.HTML_ENTITY:
                holder.highlightRange(token.getRange(), HtmlHighlighter.TEXT_HTML_ENTITY_KEY);
                break;
            case HtmlLexicalGrammar.COMMENT:
                holder.highlightRange(token.getRange(), HtmlHighlighter.TEXT_COMMENT_KEY);
                break;
            case HtmlLexicalGrammar.SCRIPT_CONTENT:
            case HtmlLexicalGrammar.STYLE_CONTENT:
                holder.highlightRange(token.getRange(), HtmlHighlighter.TEXT_OUTER_LANGUAGE_KEY);
                break;
            default:
                holder.highlightRange(token.getRange(), HtmlHighlighter.TEXT_DEFAULT_KEY);
        }
    }
}
