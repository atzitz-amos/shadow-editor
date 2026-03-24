import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {ProjectFile} from "../filetree/ProjectFile";
import {BubbleDirection} from "../../events/BubbleDirection";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class FileModifiedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private file: ProjectFile, private oldContent: string, private newContent: string) {

    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getFile(): ProjectFile {
        return this.file;
    }

    getOldContent(): string {
        return this.oldContent;
    }

    getNewContent(): string {
        return this.newContent;
    }
}