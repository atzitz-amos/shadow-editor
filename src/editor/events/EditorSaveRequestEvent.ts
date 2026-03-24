import {EditorEventBase} from "../../core/events/EditorEventBase";
import {EventSubscriber} from "../../core/events/EventSubscriber";
import {Editor} from "../Editor";
import {WorkspaceFile} from "../../core/workspace/filesystem/tree/WorkspaceFile";

/**
 *
 * @author Atzitz Amos
 * @date 3/18/2026
 * @since 1.0.0
 */
export class EditorSaveRequestEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private file: WorkspaceFile, private timestamp: number) {
        super(editor);
    }

    getTimestamp(): number {
        return this.timestamp;
    }

    getFile(): WorkspaceFile {
        return this.file;
    }
}
