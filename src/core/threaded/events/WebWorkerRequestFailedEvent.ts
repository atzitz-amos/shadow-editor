import {BubbleDirection} from "../../events/BubbleDirection";
import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {WorkerRemote} from "../wcp/remote/WorkerRemote";

export class WebWorkerRequestFailedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(
        private readonly remote: WorkerRemote,
        private readonly requestId: string,
        private readonly portId: string,
        private readonly endpoint: string,
        private readonly delayMs: number,
        private readonly error: string
    ) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_UP;
    }

    getRemote(): WorkerRemote {
        return this.remote;
    }

    getRequestId(): string {
        return this.requestId;
    }

    getPortId(): string {
        return this.portId;
    }

    getEndpoint(): string {
        return this.endpoint;
    }

    getDelayMs(): number {
        return this.delayMs;
    }

    getError(): string {
        return this.error;
    }
}

