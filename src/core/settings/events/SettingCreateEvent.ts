import {EventSubscriber} from "../../events/EventSubscriber";
import {SettingBase} from "../base/SettingBase";
import {EventBase} from "../../events/EventBase";
import {BubbleDirection} from "../../events/BubbleDirection";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class SettingCreateEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private setting: SettingBase<any>) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getSetting(): SettingBase<any> {
        return this.setting;
    }
}
