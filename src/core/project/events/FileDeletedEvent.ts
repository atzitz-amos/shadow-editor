import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";
import {ProjectFile} from "../filetree/ProjectFile";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class FileDeletedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private file: ProjectFile) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_DOWN;
    }

    public getFile(): ProjectFile {
        return this.file;
    }
}
