import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";
import {WorkspaceDirectory} from "../filesystem/tree/WorkspaceDirectory";
import {FileSystemEvent} from "./FileSystemEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class DirectoryDeletedEvent extends FileSystemEvent {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private dir: WorkspaceDirectory) {
        super(dir);
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    public getDirectory(): WorkspaceDirectory {
        return this.dir;
    }
}