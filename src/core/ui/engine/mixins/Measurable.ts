import {UIComponent} from "../components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 8/7/2026
 * @since 1.0.0
 */
export abstract class Measurable extends UIComponent {
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
