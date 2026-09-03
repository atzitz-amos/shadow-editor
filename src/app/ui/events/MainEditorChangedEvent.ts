import {BubbleDirection} from "../../../core/events/BubbleDirection";
import {EventBase} from "../../../core/events/EventBase";
import {EventSubscriber} from "../../../core/events/EventSubscriber";
import {Editor} from "../../../editor/Editor";
import {Document} from "../../../editor/core/document/Document";

/**
 *
 * @author Atzitz Amos
 * @date 8/30/2026
 * @since 1.0.0
 */
export class MainEditorChangedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private readonly editor: Editor | null) {

    }

    getNewEditor(): Editor | null {
        return this.editor;
    }

    getNewDocument(): Document | null {
        return this.editor?.getOpenedDocument() ?? null;
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.BUBBLE_BOTH;
    }
}
