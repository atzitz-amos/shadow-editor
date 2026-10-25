import {EventBase} from "../../../../../core/events/EventBase";
import {EventSubscriber} from "../../../../../core/events/EventSubscriber";
import {BubbleDirection} from "../../../../../core/events/BubbleDirection";
import {SynSuiteTestResult} from "../SynSuiteTestResult";

/**
 * Published on the main event bus after SynSuite ran one or more test cases.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class SynSuiteTestsRunEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    public constructor(private readonly results: SynSuiteTestResult[]) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    public getResults(): SynSuiteTestResult[] {
        return this.results;
    }
}
