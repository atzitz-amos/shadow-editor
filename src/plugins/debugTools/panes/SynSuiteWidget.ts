import {UIComponent} from "../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class SynSuiteWidget extends UIComponent {
    constructor() {
        super(HTMLUtils.createDiv("syn-suite-widget"));
    }

    draw(): void {
        this.setInnerHTML(`Suite`);
    }

}
