import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {Icon} from "../../../../../core/ui/icons/Icon";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 3/3/2026
 * @since 1.0.0
 */
export class SRailButton extends UIComponent {

    constructor(private readonly id: string, title: string, icon: Icon) {
        super(HTMLUtils.createElement("button.rail-item"));

        this.getUnderlyingElement().title = title;
        this.addChild(icon);
    }

    draw(): void {

    }

    getPaneId(): string {
        return this.id;
    }

    setActive(b: boolean) {
        if (b) this.getUnderlyingElement().classList.add("rail-item-active");
        else this.getUnderlyingElement().classList.remove("rail-item-active");
    }
}