import {Document} from "../Document";
import {TextRange} from "../../coordinate/range/TextRange";
import {EventBase} from "../../../../core/events/EventBase";
import {BubbleDirection} from "../../../../core/events/BubbleDirection";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";

/**
 * Fired whenever the document is modified
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class DocumentModificationEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private document: Document, private affectedRange: TextRange, private text: string | null, private deleted: string | null) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getLanguage() {
        return this.document.getLanguage();
    }

    getDocument(): Document {
        return this.document;
    }

    getAffectedRange(): TextRange {
        return this.affectedRange;
    }

    getOffset(): Offset {
        return this.affectedRange.start;
    }

    getInsertedText(): string {
        return this.text || "";
    }

    getDeletedText(): string {
        return this.deleted || "";
    }

    getType(): DocumentModificationType {
        if (this.text != null) return DocumentModificationType.INSERTION;
        return DocumentModificationType.DELETION;
    }

    getTextDelta() {
        return this.getInsertedText().length - this.getAffectedRange().getLength()
    }
}

export enum DocumentModificationType {
    INSERTION,
    DELETION
}