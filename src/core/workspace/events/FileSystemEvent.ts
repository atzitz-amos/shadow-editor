import {BubbleDirection} from "../../events/BubbleDirection";
import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {FSNodeEntry} from "../filesystem/tree/FSNodeEntry";

/**
 *
 * @author Atzitz Amos
 * @date 8/6/2026
 * @since 1.0.0
 */
export abstract class FileSystemEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private readonly entry: FSNodeEntry) {
    }

    public getEntry(): FSNodeEntry {
        return this.entry;
    }

    abstract getBubbleDirection(): BubbleDirection;
}
