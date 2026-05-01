import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {Icon} from "../../../../../core/ui/icons/Icon";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {PaneManager} from "../../../panes/PaneManager";

/**
 *
 * @author Atzitz Amos
 * @date 3/3/2026
 * @since 1.0.0
 */
export class SRailButton extends UIComponent {

    constructor(private readonly id: string, title: string, icon: Icon) {
        super(HTMLUtils.createElement("button.rail-item.show-tooltip"));

        this.getUnderlyingElement().setAttribute("data-tooltip", title);
        this.getUnderlyingElement().setAttribute("data-tooltip-position", "right");

        this.addChild(icon);

        this.addEventListener("click", () => {
            PaneManager.getInstance().togglePane(this.id);
        });
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