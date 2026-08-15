import {BubbleDirection} from "../../events/BubbleDirection";
import {EventBase} from "../../events/EventBase";
import {EventSubscriber} from "../../events/EventSubscriber";
import {FileSystemEntry} from "../filesystem/tree/FileSystemEntry";

/**
 *
 * @author Atzitz Amos
 * @date 8/6/2026
 * @since 1.0.0
 */
export abstract class FileSystemEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private readonly entry: FileSystemEntry) {
    }

    public getEntry(): FileSystemEntry {
        return this.entry;
    }

    abstract getBubbleDirection(): BubbleDirection;
}
