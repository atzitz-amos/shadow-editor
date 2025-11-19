import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {Document} from "../Document";

/**
 * Fired whenever text is inserted into the document
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class DocumentInsertEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private document: Document, private location: Offset, private text: string) {
        super(document.getEditor());
    }

    getDocument(): Document {
        return this.document;
    }

    getLocation(): Offset {
        return this.location;
    }

    getInsertedText(): string {
        return this.text;
    }
}
