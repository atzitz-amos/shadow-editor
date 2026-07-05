import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {Document} from "../../document/Document";
import {EventBase} from "../../../../core/events/EventBase";
import {BubbleDirection} from "../../../../core/events/BubbleDirection";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SynParseRequestEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    public constructor(private readonly document: Document) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_UP;
    }

    getDocument(): Document {
        return this.document;
    }
}
