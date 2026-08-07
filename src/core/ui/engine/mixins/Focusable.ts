import {UIComponent} from "../components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 8/7/2026
 * @since 1.0.0
 */
export abstract class Focusable extends UIComponent {

    focus() {
        this.getUnderlyingElement().focus();
    }

    private _initMixin() {
        this.getUnderlyingElement().setAttribute("tabindex", "-1");
    }
}
