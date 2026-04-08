import {BubbleDirection} from "../../events/BubbleDirection";
import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {WorkerRemote} from "../wcp/remote/WorkerRemote";

/**
 * Published when a worker remote is terminated or closed.
 */
export class WebWorkerTerminateEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(
        private readonly remote: WorkerRemote,
        private readonly reason: string = "terminated"
    ) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_UP;
    }

    getRemote(): WorkerRemote {
        return this.remote;
    }

    getReason(): string {
        return this.reason;
    }
}

