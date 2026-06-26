import {EventSubscriber} from "../../../core/events/EventSubscriber";
import {EditorCancellableEventBase, EditorEventBase} from "../../../core/events/EditorEventBase";
import {Editor} from "../../Editor";
import {Caret} from "../../core/caret/Caret";
import {XYPoint} from "../../core/coordinate/XYPoint";

/**
 * Fired when a key is pressed
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class KeyPressedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private event: KeyboardEvent) {
        super(editor);
    }

    getEvent(): KeyboardEvent {
        return this.event;
    }
}


/**
 * Fired when a key is released
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class KeyReleasedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private event: KeyboardEvent) {
        super(editor);
    }

    getEvent(): KeyboardEvent {
        return this.event;
    }
}


/**
 * Fired when mouse if pressed within editor bounds
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class MousePressedEvent extends EditorEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private event: MouseEvent) {
        super(editor);
    }

    getEvent(): MouseEvent {
        return this.event;
    }
}


/**
 * Fired when mouse is released within editor bounds
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class MouseReleasedEvent extends EditorEventBase {

    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private event: MouseEvent) {
        super(editor);
    }

    getEvent(): MouseEvent {
        return this.event;
    }
}

/**
 * Fired when mouse is moved within editor bounds
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class MouseMovedEvent extends EditorCancellableEventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private event: MouseEvent) {
        super(editor);
    }

    getEvent(): MouseEvent {
        return this.event;
    }

    getRelativeXY() {
        const rect = this.getEditor().getView().getLayers().layers_el.getBoundingClientRect();
        return new XYPoint(this.event.clientX - rect.left, this.event.clientY - rect.top);
    }
}

/**
 * Fired when the user types a key in the editor
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class KeyTypedEvent extends EditorCancellableEventBase {

    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(editor: Editor, private char: string, private caret: Caret) {
        super(editor);
    }

    getChar(): string {
        return this.char;
    }

    getCaret(): Caret {
        return this.caret;
    }
}