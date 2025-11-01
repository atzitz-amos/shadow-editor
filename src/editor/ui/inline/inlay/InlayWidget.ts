import {InlineWidget} from "../InlineWidget";
import {TextRange} from "../../../core/coordinate/TextRange";
import {Editor} from "../../../Editor";
import {Inlay} from "./Inlay";

/**
 * Represents an inlay widget that is displayed inline within the text editor.
 * Inlay widgets will take up space in the document flow and can be used to show additional information.
 * They can only span a single line. Use {@link BlockWidget} for multi-line widgets.
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export abstract class InlayWidget implements InlineWidget {
    getRange(): TextRange {
        return new TextRange(this.getOffset(), this.getOffset());
    }

    abstract getName(): string;


    abstract destroy(editor: Editor): void;

    /**
     * Returns the offset where the inlay widget is positioned in the document.
     * */
    abstract getOffset(): Offset;

    /**
     * Returns the logical delta that the inlay widget introduces to the document.
     * */
    getLogicalDelta(): number {
        return 1;
    }

    /**
     * This method is called to render the inlay widget. It should return the HTML span element
     * that will be inserted into the document at the specified offset.
     *
     * *Warning*: This method should not add any event listeners or complex logic, as it may be called
     * more than once during rendering. Use {@link init} method for such purposes.
     * */
    abstract getInsertedComponent(): HTMLSpanElement;

    abstract init(inlay: Inlay): void;
}
