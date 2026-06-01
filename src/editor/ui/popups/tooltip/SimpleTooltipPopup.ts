import {EditorPopup} from "../EditorPopup";
import {Editor} from "../../../Editor";
import {CloseOn} from "../../../../core/ui/api/Closeable";
import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";


/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class SimpleTooltipPopup extends EditorPopup {
    public constructor(editor: Editor, private message: string) {
        super(editor, "simple-tooltip-popup", CloseOn.DEFAULT);
    }

    clone(): UIComponent {
        return new SimpleTooltipPopup(this.editor, this.message);
    }

    public draw(): void {
        this.setInnerHTML(this.message.replaceAll("\n", "<br>"));
    }
}
