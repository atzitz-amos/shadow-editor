import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";

/**
 *
 * @author Atzitz Amos
 * @date 12/29/2025
 * @since 1.0.0
 */
export class LifecyclePeriodicSaveEvent implements EventBase {
    public static SUBSCRIBER = EventSubscriber.create(this);

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}
