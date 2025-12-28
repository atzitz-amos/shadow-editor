import {Project} from "../project/Project";
import {GlobalProjectChangedEvent} from "../project/events/GlobalProjectChangedEvent";
import {GlobalState} from "./GlobalState";

/**
 * Holds the current opened project
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class GlobalProject {
    private static instance: Project | null = null;

    public static getInstance(): Project | null {
        return this.instance;
    }

    public static open(project: Project): void {
        this.instance = project;

        GlobalState.getMainEventBus().syncPublish(new GlobalProjectChangedEvent());
    }
}
