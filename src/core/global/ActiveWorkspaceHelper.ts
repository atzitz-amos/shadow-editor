import {Workspace} from "../workspace/Workspace";
import {CurrentWorkspaceChangedEvent} from "../workspace/events/CurrentWorkspaceChangedEvent";
import {GlobalState} from "./GlobalState";
import {WorkspaceFileSystemLoadedEvent} from "../workspace/events/WorkspaceFileSystemLoadedEvent";
import {DirectoryCreatedEvent} from "../workspace/events/DirectoryCreatedEvent";
import {FileCreatedEvent} from "../workspace/events/FileCreatedEvent";
import {DirectoryDeletedEvent} from "../workspace/events/DirectoryDeletedEvent";
import {FileDeletedEvent} from "../workspace/events/FileDeletedEvent";
import {DirectoryRenamedEvent} from "../workspace/events/DirectoryRenamedEvent";
import {FileRenamedEvent} from "../workspace/events/FileRenamedEvent";

/**
 * Holds the current opened project
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class ActiveWorkspaceHelper {
    private static instance: Workspace | null = null;

    public static getInstance(): Workspace | null {
        return this.instance;
    }

    public static open(project: Workspace): void {
        this.instance = project;

        GlobalState.getMainEventBus().syncPublish(new CurrentWorkspaceChangedEvent());
    }

    static onChange(subscriber: any, callback: (ev: CurrentWorkspaceChangedEvent) => void) {
        GlobalState.getMainEventBus().subscribe(subscriber, CurrentWorkspaceChangedEvent.SUBSCRIBER, callback);
    }

    static onFilesystemReady(subscriber: any, callback: (ev: WorkspaceFileSystemLoadedEvent) => void) {
        GlobalState.getMainEventBus().subscribe(subscriber, WorkspaceFileSystemLoadedEvent.SUBSCRIBER, callback);
    }

    static onWorkspaceChanges(subscriber: any,
                              createHandler: (ev: DirectoryCreatedEvent | FileCreatedEvent) => void,
                              deleteHandler: (ev: DirectoryDeletedEvent | FileDeletedEvent) => void,
                              renameHandler: (ev: DirectoryRenamedEvent | FileRenamedEvent) => void) {
        GlobalState.getMainEventBus().subscribe(subscriber, DirectoryCreatedEvent.SUBSCRIBER, createHandler);
        GlobalState.getMainEventBus().subscribe(subscriber, FileCreatedEvent.SUBSCRIBER, createHandler);
        GlobalState.getMainEventBus().subscribe(subscriber, DirectoryDeletedEvent.SUBSCRIBER, deleteHandler);
        GlobalState.getMainEventBus().subscribe(subscriber, FileDeletedEvent.SUBSCRIBER, deleteHandler);
        GlobalState.getMainEventBus().subscribe(subscriber, DirectoryRenamedEvent.SUBSCRIBER, renameHandler);
        GlobalState.getMainEventBus().subscribe(subscriber, FileRenamedEvent.SUBSCRIBER, renameHandler);
    }
}
