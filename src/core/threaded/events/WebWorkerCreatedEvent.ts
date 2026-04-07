import {BubbleDirection} from "../../events/BubbleDirection";
import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";

/**
 *
 * @author Atzitz Amos
 * @date 4/6/2026
 * @since 1.0.0
 */
export class WebWorkerCreatedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private readonly worker: Worker) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_UP;
    }

    getWorker(): Worker {
        return this.worker;
    }
}
