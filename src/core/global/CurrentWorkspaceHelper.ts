import {Workspace} from "../workspace/Workspace";
import {CurrentWorkspaceChangedEvent} from "../workspace/events/CurrentWorkspaceChangedEvent";
import {GlobalState} from "./GlobalState";
import {WorkspaceFileSystemLoadedEvent} from "../workspace/events/WorkspaceFileSystemLoadedEvent";

/**
 * Holds the current opened project
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class CurrentWorkspaceHelper {
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
}
