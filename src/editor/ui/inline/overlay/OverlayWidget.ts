import {TextRange} from "../../../core/coordinate/TextRange";
import {InlineWidget} from "../InlineWidget";
import {Overlay} from "./Overlay";
import {Editor} from "../../../Editor";
import {HTMLSpanView} from "../view/HTMLSpanView";

/**
 * Represents an overlay UI component in the editor. Overlays are displayed above the text content
 * and can be styled independently. They also support event callbacks.
 *
 * HOWEVER, overlays are not designed to change color, font, or other text styles of the underlying text.
 * Use {@link HighlightHolder.highlightRange} instead
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export abstract class OverlayWidget implements InlineWidget {
    abstract getName(): string;

    abstract getRange(): TextRange;

    abstract destroy(editor: Editor): void;

    abstract init(overlay: Overlay): void;

    getDrawPriority(): int {
        return 1;
    }

    getClassList(): string[] {
        return [];
    }

    /**
     * @internal
     * @final
     * */
    internalInit(editor: Editor, spans: HTMLSpanElement[]) {
        this.init(new Overlay(new HTMLSpanView(editor, spans), this.getRange()));
    }
}
