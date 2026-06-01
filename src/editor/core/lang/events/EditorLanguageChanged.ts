import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {Editor} from "../../../Editor";
import {LanguageBase} from "../../../../core/lang/LanguageBase";
import {EventSubscriber} from "../../../../core/events/EventSubscriber";

/**
 *
 * @author Atzitz Amos
 * @date 5/2/2026
 * @since 1.0.0
 */
export class EditorLanguageChanged extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private language: LanguageBase | null) {
        super(editor);
    }

    public getLanguage(): LanguageBase | null {
        return this.language;
    }
}
