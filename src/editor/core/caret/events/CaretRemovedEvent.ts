import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {Caret} from "../Caret";

/**
 * Fired whenever the caret is removed
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class CaretRemovedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private caret: Caret) {
        super(caret.editor);
    }

    getCaret(): Caret {
        return this.caret;
    }
}
