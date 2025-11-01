import {TextRange} from "../../core/coordinate/TextRange";
import {Editor} from "../../Editor";

/**
 * The base interface for all inline widgets in the editor
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export interface InlineWidget {
    /**
     * Return the name of the components
     * */
    getName(): string;

    /**
     * Return the range that this inline widget covers in the document.
     * */
    getRange(): TextRange;

    /**
     * Called when the inline widget is to be destroyed. Use this to clean up any resources.
     * */
    destroy(editor: Editor): void;
}
