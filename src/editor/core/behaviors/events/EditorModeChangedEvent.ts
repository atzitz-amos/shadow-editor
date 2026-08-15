import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {Editor} from "../../../Editor";
import {IEditorMode} from "../mode/IEditorMode";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";

/**
 *
 * @author Atzitz Amos
 * @date 8/15/2026
 * @since 1.0.0
 */
export class EditorModeChangedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private readonly oldMode: IEditorMode | null, private readonly newMode: IEditorMode | null) {
        super(editor);
    }

    getOldMode(): IEditorMode | null {
        return this.oldMode;
    }

    getNewMode(): IEditorMode | null {
        return this.newMode;
    }
}
