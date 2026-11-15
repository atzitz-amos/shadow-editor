import {UIComponent} from "../../engine/components/UIComponent";

/**
 * A component wrapping an existing element, whose content is managed outside the component tree.
 * Lets plain markup (such as the children of a custom element) be given to components expecting a {@link UIComponent}.
 *
 * @author Atzitz Amos
 * @date 10/25/2026
 * @since 1.0.0
 */
export class ElementComponent extends UIComponent {
    constructor(element: HTMLElement) {
        super(element);
    }

    public draw(): void {
    }
}
