import {BubbleDirection} from "../../events/BubbleDirection";
import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {SettingBase} from "../base/SettingBase";

/**
 *
 * @author Atzitz Amos
 * @date 11/2/2025
 * @since 1.0.0
 */
export class SettingChangedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private setting: SettingBase<any>, private oldValue: any, private newValue: any) {

    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    public getSetting(): SettingBase<any> {
        return this.setting;
    }

    public getOldValue(): any {
        return this.oldValue;
    }

    public getNewValue(): any {
        return this.newValue;
    }
}
