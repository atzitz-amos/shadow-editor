import {Service} from "../../../core/threaded/service/Service";
import {Editor} from "../../Editor";
import {GlobalState} from "../../../core/global/GlobalState";
import {KeyPressedEvent, KeyTypedEvent, MousePressedEvent} from "../../events/PhysicalEvents";
import {EditorKeysHelper} from "./EditorKeysHelper";
import {CloseOn} from "../../../core/ui/api/Closeable";

/**
 *
 * @author Atzitz Amos
 * @date 5/30/2026
 * @since 1.0.0
 */
@Service
export class EditorKeyContextManager {
    private static readonly INSTANCE: EditorKeyContextManager = new EditorKeyContextManager();

    private currentEditor: Editor | null = null;

    private isFocused: boolean = false;

    static getInstance() {
        return this.INSTANCE;
    }

    static isCurrent(editor: Editor) {
        return this.INSTANCE.currentEditor === editor;
    }

    static isFocused() {
        return this.INSTANCE.isFocused;
    }

    begin() {
        GlobalState.getMainEventBus().subscribe(this, KeyPressedEvent.SUBSCRIBER, e => {
            if (e.getEvent().key === "Escape")
                EditorKeysHelper.notify(CloseOn.ESCAPE);
        });

        GlobalState.getMainEventBus().subscribe(this, KeyTypedEvent.SUBSCRIBER, e => {
            EditorKeysHelper.notify(CloseOn.KEY_TYPED);
        });

        GlobalState.getMainEventBus().subscribe(this, KeyPressedEvent.SUBSCRIBER, e => {
            EditorKeysHelper.notify(CloseOn.KEY_PRESS);
        });

        GlobalState.getMainEventBus().subscribe(this, MousePressedEvent.SUBSCRIBER, e => {
            EditorKeysHelper.notify(CloseOn.MOUSE_CLICK);
        });
    }

    bindCurrentEditor(editor: Editor) {
        if (this.currentEditor != editor) {
            EditorKeysHelper.notify(CloseOn.BLUR);
            this.currentEditor = editor;
        }
        this.isFocused = true;
    }

    unfocus() {
        this.isFocused = false;
        EditorKeysHelper.notify(CloseOn.BLUR);
    }
}
