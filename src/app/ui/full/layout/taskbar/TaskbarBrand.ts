import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";


/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export class TaskbarBrand extends UIComponent {

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("topbar-brand", root));
    }

    draw(): void {
        this.setInnerHTML(`
            <div class="logo-mark">
                <span class="logo-dot"></span>
            </div>
            <div class="brand-text">
                <div class="brand-title">Shadow Studio</div>
                <div class="brand-sub">Session · split focus</div>
            </div>`);
    }
}
