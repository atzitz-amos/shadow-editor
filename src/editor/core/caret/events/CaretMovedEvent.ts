import {EventSubscriber} from "../../../../core/events/EventSubscriber";
import {EditorEventBase} from "../../../../core/events/EditorEventBase";
import {Caret} from "../Caret";
import {LogicalPosition} from "../../coordinate/LogicalPosition";

/**
 * Fired whenever the caret is moved
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class CaretMovedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private caret: Caret, private oldPos: LogicalPosition, private newPos: LogicalPosition) {
        super(caret.editor);
    }

    getCaret(): Caret {
        return this.caret;
    }

    getOldPosition(): LogicalPosition {
        return this.oldPos;
    }

    getNewPosition(): LogicalPosition {
        return this.newPos;
    }
}
