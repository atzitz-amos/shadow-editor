import {SynFile} from "../../../../core/lang/syntax/api/SynFile";
import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {Editor} from "../../../Editor";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {LanguageBase} from "../../../../core/lang/LanguageBase";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SynTreeChangedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    public constructor(editor: Editor, private readonly file: SynFile, private readonly language: LanguageBase) {
        super(editor);
    }

    public getFile(): SynFile {
        return this.file;
    }

    public getLanguage(): LanguageBase {
        return this.language;
    }
}
