import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";
import {FileSystemEvent} from "./FileSystemEvent";
import {WorkspaceDirectory} from "../filesystem/tree/WorkspaceDirectory";

/**
 *
 * @author Atzitz Amos
 * @date 11/19/2025
 * @since 1.0.0
 */
export class DirectoryRenamedEvent extends FileSystemEvent {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private oldDir: WorkspaceDirectory, private readonly newDir: WorkspaceDirectory, private oldName: string, private newName: string) {
        super(oldDir);
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }

    getOldDir(): WorkspaceDirectory {
        return this.oldDir;
    }

    getNewDir(): WorkspaceDirectory {
        return this.newDir;
    }

    getOldName(): string {
        return this.oldName;
    }

    getNewName(): string {
        return this.newName;
    }
}