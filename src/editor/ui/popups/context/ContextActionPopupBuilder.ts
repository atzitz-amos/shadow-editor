import {Editor} from "../../../Editor";
import {PopupBuilder} from "../builder/PopupBuilder";
import {EditorInlinePopup} from "../EditorInlinePopup";
import {ContextActionsPopup} from "./ContextActionsPopup";


/**
 *
 * @author Atzitz Amos
 * @date 9/19/2026
 * @since 1.0.0
 */
export class ContextActionPopupBuilder implements PopupBuilder {
    build(editor: Editor): EditorInlinePopup {
        return new ContextActionsPopup(editor);
    }
}
