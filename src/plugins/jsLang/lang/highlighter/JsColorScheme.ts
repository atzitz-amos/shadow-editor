/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextColor} from "../../../../editor/ui/highlighter/style/TextColor";

export class JsColorScheme {
    public static readonly DEFAULT_COLOR = TextColor.of("#aeb0b6");
    public static readonly PUNCTUATION_COLOR = TextColor.of("#8b92a2");
    public static readonly KEYWORD_COLOR = TextColor.of("#7ca7ec");
    public static readonly STRING_COLOR = TextColor.of("#e3bd82");
    public static readonly COMMENT_COLOR = TextColor.of("#727b8b");
    public static readonly NUMBER_COLOR = TextColor.of("#f2a15a");

    public static readonly FUNCTION_COLOR = TextColor.of("#92c9c4");
    public static readonly VARIABLE_COLOR = TextColor.of("#abb2bf");
    public static readonly UNEXPECTED_COLOR = TextColor.of("#f06292");
}
