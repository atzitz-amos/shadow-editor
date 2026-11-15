import {EventSubscriber} from "../../../core/events/EventSubscriber";
import {EditorEventBase} from "../../../core/events/EditorEventBase";
import {Editor} from "../../Editor";

/**
 * Fired every time the scroll position of an editor's view changes, including on each frame of an animated scroll
 *
 * @author Atzitz Amos
 * @date 11/14/2026
 * @since 1.0.0
 */
export class EditorScrolledEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private readonly scrollX: number, private readonly scrollY: number) {
        super(editor);
    }

    /** The new horizontal scroll position, in pixels */
    getScrollX(): number {
        return this.scrollX;
    }

    /** The new vertical scroll position, in pixels */
    getScrollY(): number {
        return this.scrollY;
    }
}
