import {HtmlComponent} from "../../../../../../core/ui/engine/components/HtmlComponent";
import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorTabs extends HtmlComponent {
    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-tabs", root));
    }

    draw(): void {
    }
}
