import {BulkRequest} from "./BulkRequest";
import {ProjectFile} from "../../filetree/ProjectFile";
import {GlobalState} from "../../../global/GlobalState";
import {FileModifiedEvent} from "../../events/FileModifiedEvent";

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2025
 * @since 1.0.0
 */
export class BulkWriteFileRequest implements BulkRequest {
    constructor(private file: ProjectFile, private content: string) {
    }

    async fulfill(): Promise<void> {
        const old = this.file.getContent();
        if (old === this.content)
            return;

        let fileHandle = this.file.getHandle() as FileSystemFileHandle;
        if (!fileHandle)
            throw new Error("File handle is not set.");
        const writable = await fileHandle.createWritable();
        await writable.write(this.content);
        await writable.close();

        this.file.notifyContentChange(this.content);

        GlobalState.getMainEventBus().asyncPublish(new FileModifiedEvent(this.file, old, this.content));
    }
}
