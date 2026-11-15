import {UIComponent} from "../../engine/components/UIComponent";
import {HTMLUtils} from "../../../utils/HTMLUtils";
import {Describable} from "../../api/Describable";

/**
 * The default item of an {@link IdeList}: a row made of the icon of a {@link Describable}, if it has one, followed
 * by its description.
 *
 * @author Atzitz Amos
 * @date 11/14/2026
 * @since 1.0.0
 */
export class IdeIconListItem<T extends Describable = Describable> extends UIComponent {
    constructor(private readonly data: T) {
        super(HTMLUtils.createDiv("ide-icon-list-item"));
    }

    /** What the row describes */
    getData(): T {
        return this.data;
    }

    public draw(): void {
        this.setInnerHTML("");

        const iconSpan = HTMLUtils.createElement("span.ide-icon-list-item-icon", this.getUnderlyingElement());
        const icon = this.data.getIcon?.();
        if (icon) iconSpan.appendChild(icon.toHTML());

        const nameSpan = HTMLUtils.createElement("span.ide-icon-list-item-name", this.getUnderlyingElement());
        nameSpan.textContent = this.data.getDescription();
    }
}
