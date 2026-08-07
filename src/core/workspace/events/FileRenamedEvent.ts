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
export class FileRenamedEvent extends FileSystemEvent {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private oldFile: WorkspaceFile, private newFile: WorkspaceFile, private oldName: string, private newName: string) {
        super(oldFile);
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getOldFile(): WorkspaceFile {
        return this.oldFile;
    }

    getNewFile(): WorkspaceFile {
        return this.newFile;
    }

    getOldName(): string {
        return this.oldName;
    }

    getNewName(): string {
        return this.newName;
    }
}