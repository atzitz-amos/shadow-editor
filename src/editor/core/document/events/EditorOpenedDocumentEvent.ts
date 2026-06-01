import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {Editor} from "../../../Editor";
import {Document} from "../Document";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";

/**
 *
 * @author Atzitz Amos
 * @date 5/2/2026
 * @since 1.0.0
 */
export class EditorOpenedDocumentEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private document: Document) {
        super(editor);
    }

    getDocument(): Document {
        return this.document;
    }
}
