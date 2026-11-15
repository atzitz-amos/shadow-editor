import {BubbleDirection} from "../../events/BubbleDirection";
import {EventSubscriber} from "../../events/EventSubscriber";
import {ProjectBinaryFile} from "../filesystem/tree/ProjectBinaryFile";
import {FileSystemEvent} from "./FileSystemEvent";

/**
 * Separate from {@link FileCreatedEvent} so that its subscribers, which expect a text {@link ProjectFile}, never see a binary.
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class BinaryFileCreatedEvent extends FileSystemEvent {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private file: ProjectBinaryFile) {
        super(file);
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getFile(): ProjectBinaryFile {
        return this.file;
    }
}
