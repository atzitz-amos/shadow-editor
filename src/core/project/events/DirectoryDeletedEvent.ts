import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {Directory} from "../filetree/Directory";
import {BubbleDirection} from "../../events/BubbleDirection";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class DirectoryDeletedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private dir: Directory) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_DOWN;
    }

    public getDirectory(): Directory {
        return this.dir;
    }
}