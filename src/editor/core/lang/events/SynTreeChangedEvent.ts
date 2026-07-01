import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {Editor} from "../../../Editor";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {LanguageBase} from "../../../../core/lang/LanguageBase";
import {SynDocument} from "../../../../core/lang/syntax/api/document/SynDocument";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SynTreeChangedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    public constructor(editor: Editor, private readonly document: SynDocument, private readonly language: LanguageBase) {
        super(editor);
    }

    public getDocument(): SynDocument {
        return this.document;
    }

    public getLanguage(): LanguageBase {
        return this.language;
    }
}
