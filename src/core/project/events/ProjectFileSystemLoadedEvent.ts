import {EventSubscriber} from "../../events/EventSubscriber";
import {EventBase} from "../../events/EventBase";
import {BubbleDirection} from "../../events/BubbleDirection";
import {Project} from "../Project";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFileSystemLoadedEvent implements EventBase {
    public static SUBSCRIBER = EventSubscriber.create(this);

    constructor(private project: Project) {
    }

    getProject(): Project {
        return this.project;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_DOWN;
    }
}
