/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextColor} from "../../../../editor/ui/highlighter/style/TextColor";

export class JsColorScheme {
    public static readonly DEFAULT_COLOR = TextColor.of("#e6e6e0");
    public static readonly PUNCTUATION_COLOR = TextColor.of("#C0C0C0");
    public static readonly KEYWORD_COLOR = TextColor.of("#FF79C6");
    public static readonly STRING_COLOR = TextColor.of("#FFB86C");
    public static readonly COMMENT_COLOR = TextColor.of("#5C6370");
    public static readonly NUMBER_COLOR = TextColor.of("#BD93F9");

    public static readonly FUNCTION_COLOR = TextColor.of("#800080");
    public static readonly VARIABLE_COLOR = TextColor.of("#00FFFF");
}
