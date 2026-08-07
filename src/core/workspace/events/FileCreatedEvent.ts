import {BubbleDirection} from "../../events/BubbleDirection";
import {EventSubscriber} from "../../events/EventSubscriber";
import {WorkspaceFile} from "../filesystem/tree/WorkspaceFile";
import {FileSystemEvent} from "./FileSystemEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class FileCreatedEvent extends FileSystemEvent {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private file: WorkspaceFile) {
        super(file);
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getFile(): WorkspaceFile {
        return this.file;
    }
}
