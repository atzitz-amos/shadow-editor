import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {EditorInlinePopup} from "../EditorInlinePopup";
import {Editor} from "../../../Editor";
import {CloseOn} from "../../../../core/ui/api/Closeable";

/**
 *
 * @author Atzitz Amos
 * @date 9/19/2026
 * @since 1.0.0
 */
export class ContextActionsPopup extends EditorInlinePopup {
    public constructor(editor: Editor) {
        super(editor, "context-actions-popup", CloseOn.DEFAULT)
    }

    public draw(): void {
        throw new Error("Method not implemented.");
    }

    clone(): UIComponent {
        throw new Error("Method not implemented.");
    }

}
