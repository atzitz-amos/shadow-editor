import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {SEditorBreadcrumbs} from "./SEditorBreadcrumbs";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorAreaHeader extends UIComponent {
    private readonly actionsElement: HTMLElement;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createElement("header.column-header", root));

        this.addChild(new SEditorBreadcrumbs(this.getUnderlyingElement()));
        this.actionsElement = HTMLUtils.createDiv("column-header-actions");
    }

    draw(): void {
        this.actionsElement.innerHTML = `
            <button class="icon-button subtle" title="Split column">
                <i class="fa-solid fa-up-down-left-right"></i>
            </button>
        `;

        this.drawChildren();
    }

}
