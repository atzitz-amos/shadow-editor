import {EventBase} from "../../events/EventBase";
import {BubbleDirection} from "../../events/BubbleDirection";
import {EventSubscriber} from "../../events/EventSubscriber";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class GlobalProjectChangedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_DOWN;
    }
}
