import {BubbleDirection} from "../../../../core/events/BubbleDirection";
import {EventBase} from "../../../../core/events/EventBase";
import {View} from "../View";
import {ViewPropertiesManager} from "./ViewPropertiesManager";

/**
 *
 * @author Atzitz Amos
 * @date 11/5/2025
 * @since 1.0.0
 */
export class ViewVisualPropertiesChangedEvent implements EventBase {
    constructor(private view: View) {
    }

    public getView(): View {
        return this.view;
    }

    public getViewProperties(): ViewPropertiesManager {
        return this.view.getProperties()
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}
