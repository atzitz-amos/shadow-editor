import {BulkRequest} from "./BulkRequest";
import {ProjectFile} from "../../filetree/ProjectFile";
import {Directory} from "../../filetree/Directory";
import {GlobalState} from "../../../global/GlobalState";
import {FileDeletedEvent} from "../../events/FileDeletedEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2025
 * @since 1.0.0
 */
export class BulkDeleteFileRequest implements BulkRequest {
    private readonly name: string;

    constructor(private parent: Directory, private file: ProjectFile) {
        this.name = file.getName();
    }

    async fulfill(): Promise<void> {
        if (!this.parent.getHandle())
            throw new Error(`Parent directory handle is null.`);
        await this.parent.getHandle()!.removeEntry(this.name);
        this.file.setHandle(null);

        this.parent.removeEntry(this.file);

        GlobalState.getMainEventBus().asyncPublish(new FileDeletedEvent(this.file));
    }
}
