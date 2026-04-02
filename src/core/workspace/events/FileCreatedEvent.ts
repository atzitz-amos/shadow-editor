import {EventBase} from "../../events/EventBase";
import {BubbleDirection} from "../../events/BubbleDirection";
import {EventSubscriber} from "../../events/EventSubscriber";
import {WorkspaceFile} from "../filesystem/tree/WorkspaceFile";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class FileCreatedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private file: WorkspaceFile) {

    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getFile(): WorkspaceFile {
        return this.file;
    }
}
