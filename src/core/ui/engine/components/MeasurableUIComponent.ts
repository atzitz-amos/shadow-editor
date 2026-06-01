import {UIComponent} from "./UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export abstract class MeasurableUIComponent extends UIComponent {
    public measure(parent: UIComponent): DOMRect {
        const ghost = this.clone();

        parent.getUnderlyingElement().appendChild(ghost.getUnderlyingElement());

        try {
            this.draw.call(ghost);
            return ghost.getBBox();
        } finally {
            ghost.dispose();
        }
    }

    abstract clone(): UIComponent;
}
