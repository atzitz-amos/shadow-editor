import {BulkRequest} from "./BulkRequest";
import {ProjectFile} from "../../filetree/ProjectFile";
import {Directory} from "../../filetree/Directory";
import {GlobalState} from "../../../global/GlobalState";
import {FileCreatedEvent} from "../../events/FileCreatedEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2025
 * @since 1.0.0
 */
export class BulkCreateFileRequest implements BulkRequest {
    private readonly name: string;

    constructor(private parent: Directory, private file: ProjectFile) {
        this.name = file.getName(); // Store the name to prevent issues if the file name changes before fulfillment
    }

    async fulfill(): Promise<void> {
        if (!this.parent.getHandle())
            throw new Error(`Parent directory handle is not set for creating file '${this.name}'.`);
        const handle = await this.parent.getHandle()!.getFileHandle(this.name, {create: true});

        this.file.setHandle(handle);
        this.parent.addEntry(this.file);

        GlobalState.getMainEventBus().asyncPublish(new FileCreatedEvent(this.file));
    }
}
