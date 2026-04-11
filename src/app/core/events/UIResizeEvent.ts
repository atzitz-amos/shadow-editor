import {BubbleDirection} from "../../../core/events/BubbleDirection";
import {EventBase} from "../../../core/events/EventBase";
import {EventSubscriber} from "../../../core/events/EventSubscriber";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class UIResizeEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

}
