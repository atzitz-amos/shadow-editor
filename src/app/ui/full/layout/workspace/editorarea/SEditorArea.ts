import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {SEditorAreaHeader} from "./SEditorAreaHeader";
import {SEditorTabs} from "./SEditorTabs";
import {SMainEditorView} from "./SMainEditorView";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export class SEditorArea extends UIComponent {
    private bodyElement: HTMLElement;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("focus-column primary", root));

        this.addChild(new SEditorAreaHeader(this.getUnderlyingElement()));

        this.bodyElement = HTMLUtils.createDiv("column-body", this.getUnderlyingElement());
        this.addChild(new SEditorTabs(this.bodyElement));
        this.addChild(new SMainEditorView(this.bodyElement));
    }

    draw() {
        this.drawChildren();
    }
}
