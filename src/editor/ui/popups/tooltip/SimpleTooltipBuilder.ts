import {PopupBuilder} from "../builder/PopupBuilder";
import {SimpleTooltipPopup} from "./SimpleTooltipPopup";
import {Editor} from "../../../Editor";
import {EditorInlinePopup} from "../EditorInlinePopup";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SimpleTooltipBuilder implements PopupBuilder {
    public constructor(private message: string) {

    }

    build(editor: Editor): EditorInlinePopup {
        return new SimpleTooltipPopup(editor, this.message);
    }

}
