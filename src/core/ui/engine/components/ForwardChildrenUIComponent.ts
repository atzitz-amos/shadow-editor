import {UIComponent} from "./UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 7/4/2026
 * @since 1.0.0
 */
export abstract class ForwardChildrenUIComponent extends UIComponent {

    private forwardTo: HTMLElement | null = null;

    forwardChildrenTo(forwardTo: HTMLElement) {
        this.forwardTo = forwardTo;
    }

    addChild(child: UIComponent) {
        if (this.forwardTo) this.addChildTo(child, this.forwardTo);
        else super.addChild(child);
    }
}
