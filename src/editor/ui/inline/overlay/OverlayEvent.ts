import {Editor} from "../../../Editor";
import {XYPoint} from "../../../core/coordinate/XYPoint";

/**
 * Represents an event related to the overlay component in the editor's UI.
 *
 * @author Atzitz Amos
 * @date 10/24/2025
 * @since 1.0.0
 */
export class OverlayEvent {
    constructor(private editor: Editor, private event: MouseEvent) {

    }

    getEditor(): Editor {
        return this.editor;
    }

    getEvent(): MouseEvent {
        return this.event;
    }

    getXY(): XYPoint {
        return new XYPoint(this.event.clientX, this.event.clientY);
    }

    getBounds(): DOMRect {
        return (this.event.target as HTMLElement).getBoundingClientRect();
    }
}
