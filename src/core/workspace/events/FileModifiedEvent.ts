import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";
import {WorkspaceFile} from "../filesystem/tree/WorkspaceFile";
import {FileSystemEvent} from "./FileSystemEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class FileModifiedEvent extends FileSystemEvent {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private file: WorkspaceFile, private oldContent: string, private newContent: string) {
        super(file);
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getFile(): WorkspaceFile {
        return this.file;
    }

    getOldContent(): string {
        return this.oldContent;
    }

    getNewContent(): string {
        return this.newContent;
    }
}