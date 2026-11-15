import {UIMenuElement} from "./UIMenuElement";
import {HTMLUtils} from "../../../../utils/HTMLUtils";

/**
 * A non interactive title shown in a menu, typically above a group of actions.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class UIMenuHeader extends UIMenuElement {
    public constructor(private readonly text: string) {
        super(HTMLUtils.createDiv("ui-menu-header"));
    }

    draw(): void {
        this.getUnderlyingElement().textContent = this.text;
    }
}
