import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {Document} from "../Document";
import {TextRange} from "../../coordinate/TextRange";

/**
 * Fired whenever the document is modified
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class DocumentModificationEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private document: Document, private affectedRange: TextRange, private text: string | null) {
        super(document.getEditor());
    }

    getDocument(): Document {
        return this.document;
    }

    getAffectedRange(): TextRange {
        return this.affectedRange;
    }

    getLocation(): Offset {
        return this.affectedRange.start;
    }

    getInsertedText(): string {
        return this.text || "";
    }

    getType(): DocumentModificationType {
        if (this.text != null) return DocumentModificationType.INSERTION;
        return DocumentModificationType.DELETION;
    }
}

export enum DocumentModificationType {
    INSERTION,
    DELETION
}