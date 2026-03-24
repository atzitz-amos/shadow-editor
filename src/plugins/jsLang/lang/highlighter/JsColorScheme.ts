/*
 * Author: Atzitz Amos
 * Date: 10/6/2025
 */

import {TextColor} from "../../../../editor/ui/highlighter/style/TextColor";

export class JsColorScheme {
    public static readonly DEFAULT_COLOR = TextColor.of("#d5dae6");
    public static readonly PUNCTUATION_COLOR = TextColor.of("#d5dae6");
    public static readonly KEYWORD_COLOR = TextColor.of("#7ca7ec");
    public static readonly STRING_COLOR = TextColor.of("#e3bd82");
    public static readonly COMMENT_COLOR = TextColor.of("#606674");
    public static readonly NUMBER_COLOR = TextColor.of("#f2a15a");

    public static readonly FUNCTION_COLOR = TextColor.of("#b0a3e2");
    public static readonly VARIABLE_COLOR = TextColor.of("#dfefff");
}
