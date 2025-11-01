import {Editor} from "../Editor";
import {KeyPressedEvent} from "../events/PhysicalEvents";

/**
 *
 * @author Atzitz Amos
 * @date 10/25/2025
 * @since 1.0.0
 */
export class EditorCallbacksUtils {
    public static cancelOnType(editor: Editor, obj: Object, callback: () => void): void {
        editor.getEventBus().subscribe(obj, KeyPressedEvent.SUBSCRIBER, callback);
    }

    public static removeAllCallbacks(editor: Editor, obj: Object) {
        editor.getEventBus().unsubscribeAll(obj);
    }
}
