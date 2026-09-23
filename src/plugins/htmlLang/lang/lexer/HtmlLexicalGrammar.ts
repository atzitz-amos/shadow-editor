import {LexicalBuilder} from "../../../../lang/syntax/builder/tokens/TokenType";

/**
 *
 * @author Atzitz Amos
 * @date 9/17/2026
 * @since 1.0.0
 */
export class HtmlLexicalGrammar {
    public static readonly EOL = LexicalBuilder.makeSkippable("EOL");

    public static readonly WHITESPACE = LexicalBuilder.makeSkippable("WHITESPACE");

    public static readonly TAG_OPEN_BRACKET = LexicalBuilder.make("TAG_OPEN");

    public static readonly TAG_CLOSE_BRACKET = LexicalBuilder.make("TAG_CLOSE");

    public static readonly TAG_SLASH_OPEN_BRACKET = LexicalBuilder.make("TAG_SLASH_OPEN");

    public static readonly TAG_SLASH_CLOSE_BRACKET = LexicalBuilder.make("TAG_SLASH_CLOSE");

    public static readonly COMMENT = LexicalBuilder.makeComment("COMMENT");

    public static readonly TAG_NAME = LexicalBuilder.make("TAG_NAME");

    public static readonly TAG_ATTRIBUTE_NAME = LexicalBuilder.make("TAG_ATTRIBUTE_NAME");

    public static readonly TEXT = LexicalBuilder.make("IDENTIFIER");

    public static readonly STRING = LexicalBuilder.make("STRING");

    public static readonly HTML_ENTITY = LexicalBuilder.make("HTML_ENTITY");

    public static readonly EQUALS = LexicalBuilder.make("EQUALS");
    public static readonly SCRIPT_CONTENT = LexicalBuilder.make("SCRIPT_CONTENT");
    public static readonly STYLE_CONTENT = LexicalBuilder.make("STYLE_CONTENT");
}
