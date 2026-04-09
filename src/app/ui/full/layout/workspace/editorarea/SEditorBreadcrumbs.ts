import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorBreadcrumbs extends UIComponent {
    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-breadcrumbs", root));
    }

    draw(): void {
        this.setInnerHTML(`
            <span>shadow-editor</span>
            <span class="crumb-sep">/</span>
            <span>src</span>
            <span class="crumb-sep">/</span>
            <span>app</span>
            <span class="crumb-sep">/</span>
            <span class="crumb-active">ShadowApp.ts</span>`
        );
    }
}
