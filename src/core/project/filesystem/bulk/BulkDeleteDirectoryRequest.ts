import {Directory} from "../../filetree/Directory";
import {BulkRequest} from "./BulkRequest";
import {GlobalState} from "../../../global/GlobalState";
import {DirectoryDeletedEvent} from "../../events/DirectoryDeletedEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2025
 * @since 1.0.0
 */
export class BulkDeleteDirectoryRequest implements BulkRequest {
    private readonly name: string;

    constructor(private parent: Directory, private directory: Directory) {
        this.name = directory.getName();
    }

    async fulfill(): Promise<void> {
        if (!this.directory.getHandle()) return;

        let parentHandle = this.parent.getHandle();
        if (!parentHandle)
            throw new Error("Parent directory handle is not set.");
        await parentHandle.removeEntry(this.name, {recursive: true});

        this.parent.removeEntry(this.directory);

        GlobalState.getMainEventBus().asyncPublish(new DirectoryDeletedEvent(this.directory));
    }
}
