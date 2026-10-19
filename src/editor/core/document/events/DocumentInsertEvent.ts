import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {Document} from "../Document";
import {EventBase} from "../../../../core/events/EventBase";
import {BubbleDirection} from "../../../../core/events/BubbleDirection";

/**
 * Fired whenever text is inserted into the document
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class DocumentInsertEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private document: Document, private location: Offset, private text: string) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_UP;
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
