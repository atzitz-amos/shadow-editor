import {Editor} from "../../../Editor";
import {EditorPopup} from "../EditorPopup";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export interface PopupBuilder {
    build(editor: Editor): EditorPopup;
}
