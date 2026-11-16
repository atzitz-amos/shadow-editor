import {Fragment} from "../../../editor/core/components/fragments/Fragment";
import {FragmentStyle} from "../../../core/highlighter/FragmentStyle";

/**
 *
 * @author Atzitz Amos
 * @date 11/16/2026
 * @since 1.0.0
 */
export interface ICustomHighlighter {
    allowHighlighting(fragment: Fragment): boolean;

    getDefaultHighlighting(fragment: Fragment): FragmentStyle;
}
