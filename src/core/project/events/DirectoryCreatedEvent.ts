import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {ProjectFile} from "../filetree/ProjectFile";
import {BubbleDirection} from "../../events/BubbleDirection";
import {Directory} from "../filetree/Directory";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class DirectoryCreatedEvent implements EventBase {
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
