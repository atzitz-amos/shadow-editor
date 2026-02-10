import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";
import {StartupPhase} from "../startup/StartupPhase";

/**
 * Event emitted when a startup phase fails.
 *
 * @author Atzitz Amos
 * @date 2/3/2026
 * @since 1.0.0
 */
export class StartupFailedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(
        private readonly phase: StartupPhase,
        private readonly error: Error,
        private readonly aborted: boolean
    ) {}

    /**
     * Get the phase that failed.
     */
    getPhase(): StartupPhase {
        return this.phase;
    }

    /**
     * Get the error that caused the failure.
     */
    getError(): Error {
        return this.error;
    }

    /**
     * Whether the startup was aborted due to this failure.
     */
    wasAborted(): boolean {
        return this.aborted;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}

