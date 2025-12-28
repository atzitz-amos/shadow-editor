import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {Document} from "../Document";
import {TextRange} from "../../coordinate/TextRange";

/**
 * Fired whenever text is deleted from the document
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class DocumentDeleteEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private document: Document, private range: TextRange) {
        super(document.getEditor());
    }

    getDocument(): Document {
        return this.document;
    }

    getDeletedRange(): TextRange {
        return this.range;
    }
}
