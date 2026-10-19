import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {Document} from "../Document";
import {TextRange} from "../../coordinate/range/TextRange";
import {EventBase} from "../../../../core/events/EventBase";
import {BubbleDirection} from "../../../../core/events/BubbleDirection";

/**
 * Fired whenever text is deleted from the document
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class DocumentDeleteEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private document: Document, private range: TextRange, private readonly deletedText: string) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_UP;
    }

    getDeletedText(): string {
        return this.deletedText;
    }

    getDocument(): Document {
        return this.document;
    }

    getDeletedRange(): TextRange {
        return this.range;
    }
}
