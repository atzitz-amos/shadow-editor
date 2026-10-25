import {EventBase} from "../../../../../core/events/EventBase";
import {EventSubscriber} from "../../../../../core/events/EventSubscriber";
import {BubbleDirection} from "../../../../../core/events/BubbleDirection";

/**
 * Published on the main event bus whenever a SynSuite test case is added, modified or removed.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class SynSuiteTestsChangedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    /**
     * @param testId id of the changed test, null when several tests changed at once
     */
    public constructor(private readonly testId: string | null) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    public getTestId(): string | null {
        return this.testId;
    }
}
