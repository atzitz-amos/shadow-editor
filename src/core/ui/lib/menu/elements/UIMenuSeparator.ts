import {UIMenuElement} from "./UIMenuElement";
import {HTMLUtils} from "../../../../utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class UIMenuSeparator extends UIMenuElement {
    public constructor() {
        super(HTMLUtils.createDiv("ui-menu-separator"));
    }

    draw(): void {
    }
}
