import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";
import {Workspace} from "../Workspace";
import {WorkspaceDirectory} from "../filesystem/tree/WorkspaceDirectory";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class DirectoryDeletedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private dir: WorkspaceDirectory) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    public getDirectory(): WorkspaceDirectory {
        return this.dir;
    }
}