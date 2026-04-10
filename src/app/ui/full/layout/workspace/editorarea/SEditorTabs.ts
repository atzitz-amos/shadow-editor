import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorTabs extends UIComponent {
    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-tabs", root));
    }

    draw(): void {
    }
}
