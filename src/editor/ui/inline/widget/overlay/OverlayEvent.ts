import {XYPoint} from "../../../../core/coordinate/XYPoint";
import {Editor} from "../../../../Editor";

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
        return new XYPoint(this.event.x, this.event.y);
    }

    getBounds(): DOMRect {
        return (this.event.target as HTMLElement).getBoundingClientRect();
    }

    preventPropagation(): void {
        this.event.stopPropagation();
    }
}
