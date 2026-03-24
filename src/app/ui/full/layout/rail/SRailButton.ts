import {HtmlComponent} from "../../../../../core/ui/engine/components/HtmlComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 3/3/2026
 * @since 1.0.0
 */
export class SRailButton extends HtmlComponent {
    private readonly icon: string;

    constructor(root: HTMLElement, title: string, icon: string) {
        super(HTMLUtils.createElement("button.rail-item", root));

        this.getUnderlyingElement().title = title;
        this.icon = icon;
    }

    draw(): void {
        this.setInnerHTML(`<i class="fa-solid ${this.icon}"></i>`);
    }

    setActive(b: boolean) {
        if (b) this.getUnderlyingElement().classList.add("rail-item-active");
        else this.getUnderlyingElement().classList.remove("rail-item-active");
    }
}
