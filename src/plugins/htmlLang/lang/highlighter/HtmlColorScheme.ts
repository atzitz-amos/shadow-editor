import {TextColor} from "../../../../editor/ui/highlighter/style/TextColor";

/**
 *
 * @author Atzitz Amos
 * @date 9/17/2026
 * @since 1.0.0
 */
export class HtmlColorScheme {
    public static readonly DEFAULT_COLOR = TextColor.of("#d1d1d1");

    public static readonly TAG_BRACKET_COLOR = TextColor.of("#537481");
    public static readonly TAG_NAME_COLOR = TextColor.of("#7a9c79");
    public static readonly TAG_ATTRIBUTE_COLOR = TextColor.of("#5d909f");

    public static readonly STRING_COLOR = TextColor.of("#ce9178");
    public static readonly HTML_ENTITY_COLOR = TextColor.of("#d7ba7d");
    public static readonly COMMENT_COLOR = TextColor.of("#545451");

    public static readonly OUTER_LANGUAGE_COLOR = TextColor.of("#545451");
}
