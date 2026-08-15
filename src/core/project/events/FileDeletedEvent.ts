import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";
import {ProjectFile} from "../filesystem/tree/ProjectFile";
import {FileSystemEvent} from "./FileSystemEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class FileDeletedEvent extends FileSystemEvent {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private file: ProjectFile) {
        super(file);
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    public getFile(): ProjectFile {
        return this.file;
    }
}
