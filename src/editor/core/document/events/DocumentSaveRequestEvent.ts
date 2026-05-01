import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {WorkspaceFile} from "../../../../core/workspace/filesystem/tree/WorkspaceFile";
import {BubbleDirection} from "../../../../core/events/BubbleDirection";
import {EventBase} from "../../../../core/events/EventBase";
import {Document} from "../Document";

/**
 *
 * @author Atzitz Amos
 * @date 3/18/2026
 * @since 1.0.0
 */
export class DocumentSaveRequestEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private document: Document, private file: WorkspaceFile, private timestamp: number) {
    }

    getDocument(): Document {
        return this.document;
    }

    getTimestamp(): number {
        return this.timestamp;
    }

    getFile(): WorkspaceFile {
        return this.file;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}
