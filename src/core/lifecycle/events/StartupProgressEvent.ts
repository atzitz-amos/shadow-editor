import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";

/**
 * Event emitted during startup to report progress.
 * Subscribe to this event to update a progress bar or splash screen.
 *
 * @author Atzitz Amos
 * @date 2/3/2026
 * @since 1.0.0
 */
export class StartupProgressEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(
        private readonly phaseName: string,
        private readonly phaseIndex: number,
        private readonly totalPhases: number,
        private readonly completed: boolean = false
    ) {
    }

    /**
     * Get the name of the current phase being executed.
     */
    getPhaseName(): string {
        return this.phaseName;
    }

    /**
     * Get the index of the current phase (0-based).
     */
    getPhaseIndex(): number {
        return this.phaseIndex;
    }

    /**
     * Get the total number of phases.
     */
    getTotalPhases(): number {
        return this.totalPhases;
    }

    /**
     * Get the progress as a percentage (0-100).
     */
    getPercent(): number {
        if (this.totalPhases === 0) return 100;
        if (this.completed) {
            return ((this.phaseIndex + 1) / this.totalPhases) * 100;
        }
        return ((this.phaseIndex + 1) / this.totalPhases) * 100;
    }

    /**
     * Whether this phase has completed.
     */
    isCompleted(): boolean {
        return this.completed;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}

