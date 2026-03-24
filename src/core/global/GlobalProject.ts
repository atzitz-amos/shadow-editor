import {Workspace} from "../workspace/Workspace";
import {GlobalProjectChangedEvent} from "../workspace/events/GlobalProjectChangedEvent";
import {GlobalState} from "./GlobalState";

/**
 * Holds the current opened project
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class GlobalProject {
    private static instance: Workspace | null = null;

    public static getInstance(): Workspace | null {
        return this.instance;
    }

    public static open(project: Workspace): void {
        this.instance = project;

        GlobalState.getMainEventBus().syncPublish(new GlobalProjectChangedEvent());
    }
}
