import {HtmlComponent} from "../../../../../core/ui/engine/components/HtmlComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SEditorLeftPaneViewer} from "./pane/SEditorLeftPaneViewer";
import {SEditorArea} from "./editorarea/SEditorArea";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorWorkspace extends HtmlComponent {
    constructor(root: HTMLElement) {
        super(HTMLUtils.createElement("section.workspace", root));

        this.addChild(new SEditorLeftPaneViewer(this.getUnderlyingElement()));

        const focusColumns = HTMLUtils.createDiv("focus-columns", this.getUnderlyingElement());
        this.addChild(new SEditorArea(focusColumns));
    }

    draw(): void {
        this.drawChildren()
    }

}
