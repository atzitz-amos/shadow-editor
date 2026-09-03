import {EditorEventBase} from "../../../core/events/EditorEventBase";
import {Editor} from "../../Editor";
import {DocumentView} from "../../core/document/view/DocumentView";
import {Document} from "../../core/document/Document";
import {EventSubscriber} from "../../../core/events/EventSubscriber";

/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export class EditorDocumentChangedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private readonly oldDocument: Document, private readonly newDocument: DocumentView) {
        super(editor);
    }

    getOldDocument(): Document {
        return this.oldDocument;
    }

    getNewDocumentView(): DocumentView {
        return this.newDocument;
    }

    getNewDocument(): Document {
        return this.newDocument.getDocument();
    }
}
