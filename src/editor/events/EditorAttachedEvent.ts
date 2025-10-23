import {EventSubscriber} from "../core/events/EventSubscriber";
import {Editor} from "../Editor";
import {EditorEventBase} from "../core/events/EditorEventBase";

/**
 * Fired when the editor is first attached to an html component
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class EditorAttachedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private root: HTMLElement) {
        super(editor);
    }

    getRoot(): HTMLElement {
        return this.root;
    }
}
