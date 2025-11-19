import {BulkRequest} from "./BulkRequest";
import {Directory} from "../../filetree/Directory";
import {GlobalState} from "../../../global/GlobalState";
import {DirectoryCreatedEvent} from "../../events/DirectoryCreatedEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2025
 * @since 1.0.0
 */
export class BulkCreateDirectoryRequest implements BulkRequest {
    constructor(private parent: Directory, private dir: Directory) {
    }

    public async fulfill(): Promise<void> {
        if (!this.parent.getHandle())
            throw new Error(`Parent directory handle is null.`);
        const newDirHandle = await this.parent.getHandle()!.getDirectoryHandle(this.dir.getName(), {create: true});
        this.dir.setHandle(newDirHandle);

        this.parent.addEntry(this.dir);

        GlobalState.getMainEventBus().asyncPublish(new DirectoryCreatedEvent(this.dir));
    }
}
