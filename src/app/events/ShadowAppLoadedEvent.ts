import {BubbleDirection} from "../../core/events/BubbleDirection";
import {EventBase} from "../../core/events/EventBase";
import {EventSubscriber} from "../../core/events/EventSubscriber";
import {ShadowApp} from "../ShadowApp";

/**
 *
 * @author Atzitz Amos
 * @date 11/5/2025
 * @since 1.0.0
 */
export class ShadowAppLoadedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private shadow: ShadowApp) {
    }

    public getShadowApp(): ShadowApp {
        return this.shadow;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}
