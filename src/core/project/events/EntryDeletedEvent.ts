import {FileSystemEvent} from "./FileSystemEvent";
import {EventSubscriber} from "../../events/EventSubscriber";
import {BubbleDirection} from "../../events/BubbleDirection";
import {FileSystemEntry} from "../filesystem/tree/FileSystemEntry";

/**
 *
 * @author Atzitz Amos
 * @date 8/13/2026
 * @since 1.0.0
 */
export class EntryDeletedEvent extends FileSystemEvent {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(entry: FileSystemEntry) {
        super(entry);
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}