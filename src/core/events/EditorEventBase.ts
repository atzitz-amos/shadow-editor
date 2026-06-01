import {CancellableEvent, EventBase} from "./EventBase";
import {Editor} from "../../editor/Editor";
import {BubbleDirection} from "./BubbleDirection";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export abstract class EditorEventBase implements EventBase {
    protected constructor(protected editor: Editor) {
    }

    public getEditor(): Editor {
        return this.editor;
    }

    public getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}


export abstract class EditorCancellableEventBase extends EditorEventBase implements CancellableEvent {
    private cancelled: boolean = false;

    cancel(): void {
        this.cancelled = true;
    }

    isCancelled(): boolean {
        return this.cancelled;
    }

}