import {TextRange} from "../../../core/text/range/TextRange";
import {TextAttributeKey} from "../../../editor/ui/highlighter/style/TextAttributeKey";
import {ICustomHighlighter} from "./ICustomHighlighter";
import {TextColor} from "../../../editor/ui/highlighter/style/TextColor";
import {Fragment} from "../../../editor/core/components/fragments/Fragment";

/**
 *
 * @author Atzitz Amos
 * @date 11/16/2026
 * @since 1.0.0
 */
export class FocusedModeHighlighter implements ICustomHighlighter {
    constructor(private readonly range: TextRange) {
    }

    allowHighlighting(fragment: Fragment): boolean {
        return this.range.intersects(fragment.getRange());
    }

    getDefaultHighlighting(fragment: Fragment): TextAttributeKey {
        return TextAttributeKey.of(TextColor.of("#4e4e4e"))
    }
}
