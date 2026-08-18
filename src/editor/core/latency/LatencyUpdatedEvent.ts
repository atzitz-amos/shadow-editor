import {EventBase} from "../../../core/events/EventBase";
import {EventSubscriber} from "../../../core/events/EventSubscriber";
import {BubbleDirection} from "../../../core/events/BubbleDirection";

/**
 *
 * @author Atzitz Amos
 * @date 8/16/2026
 * @since 1.0.0
 */
export class LatencyUpdatedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private latency: number) {
    }

    getLatency(): number {
        return this.latency;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.NO_BUBBLES;
    }
}
