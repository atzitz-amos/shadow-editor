import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {ProjectFile} from "../../../../core/project/filesystem/tree/ProjectFile";
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

    constructor(private document: Document, private file: ProjectFile, private timestamp: number) {
    }

    getDocument(): Document {
        return this.document;
    }

    getTimestamp(): number {
        return this.timestamp;
    }

    getFile(): ProjectFile {
        return this.file;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}
