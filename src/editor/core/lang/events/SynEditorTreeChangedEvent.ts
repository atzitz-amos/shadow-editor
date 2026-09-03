import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {Editor} from "../../../Editor";
import {SynDocument} from "../../../../lang/syntax/api/document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 9/1/2026
 * @since 1.0.0
 */
export class SynEditorTreeChangedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private readonly document: SynDocument) {
        super(editor);
    }

    getSynDocument(): SynDocument {
        return this.document;
    }
}
