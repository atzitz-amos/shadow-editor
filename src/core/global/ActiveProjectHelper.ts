import {Project} from "../project/Project";
import {CurrentProjectChangedEvent} from "../project/events/CurrentProjectChangedEvent";
import {GlobalState} from "./GlobalState";
import {ProjectFileSystemLoadedEvent} from "../project/events/ProjectFileSystemLoadedEvent";

/**
 * Holds the current opened project
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class ActiveProjectHelper {
    private static instance: Project | null = null;

    public static getInstance(): Project | null {
        return this.instance;
    }

    public static open(project: Project): void {
        this.instance = project;

        GlobalState.getMainEventBus().syncPublish(new CurrentProjectChangedEvent());
    }

    static onChange(subscriber: any, callback: (ev: CurrentProjectChangedEvent) => void) {
        GlobalState.getMainEventBus().subscribe(subscriber, CurrentProjectChangedEvent.SUBSCRIBER, callback);
    }

    static onFilesystemReady(subscriber: any, callback: (ev: ProjectFileSystemLoadedEvent) => void) {
        GlobalState.getMainEventBus().subscribe(subscriber, ProjectFileSystemLoadedEvent.SUBSCRIBER, callback);
    }
}
