import {BubbleDirection} from "../../core/events/BubbleDirection";
import {EventBase} from "../../core/events/EventBase";
import {EventSubscriber} from "../../core/events/EventSubscriber";
import {ShadowApp} from "../ShadowApp";
import {ShadowUIFactory} from "../ui/ShadowUIFactory";

/**
 *
 * @author Atzitz Amos
 * @date 11/5/2025
 * @since 1.0.0
 */
export class ShadowAppGUILoadedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private shadowUI: ShadowUIFactory) {
    }

    public getShadowUI(): ShadowUIFactory {
        return this.shadowUI;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}
