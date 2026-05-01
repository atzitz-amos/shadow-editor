import {EventSubscriber} from "../../events/EventSubscriber";
import {EventBase} from "../../events/EventBase";
import {BubbleDirection} from "../../events/BubbleDirection";
import {Workspace} from "../Workspace";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class WorkspaceFileSystemLoadedEvent implements EventBase {
    public static SUBSCRIBER = EventSubscriber.create(this);

    constructor(private workspace: Workspace) {
    }

    getWorkspace(): Workspace {
        return this.workspace;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_DOWN;
    }
}
