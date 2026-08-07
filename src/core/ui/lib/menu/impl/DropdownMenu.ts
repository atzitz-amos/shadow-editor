import {Icon} from "../../../icons/Icon";
import {FaIcon} from "../../../icons/FaIcon";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIMenu} from "../UIMenu";
import {UIComponent} from "../../../engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class DropdownMenu extends UIMenu {
    private readonly icon: Icon;
    private readonly description: string;

    public constructor(root: HTMLElement, icon: Icon = FaIcon.faMenu(), description: string = "") {
        super(HTMLUtils.createElement("details.ui-dropdown-menu", root));
        this.icon = icon;
        this.description = description;
    }

    public draw(): void {
        const summary = HTMLUtils.createElement(`summary.icon-button.subtle${this.description === '' ? '' : '.show-tooltip'}`, this.getUnderlyingElement());
        summary.setAttribute("data-tooltip", this.description);
        summary.setAttribute("data-tooltip-position", "top");
        summary.setAttribute("aria-label", this.description);
        this.addChildTo(this.icon, summary);

        this.addHtmlElement(summary);

        this.drawChildren();
    }

    close() {
        (this.getUnderlyingElement() as HTMLDetailsElement).open = false;
    }

    open(): void {
        (this.getUnderlyingElement() as HTMLDetailsElement).open = true;
    }

    clone(): UIComponent {
        return new DropdownMenu(this.getUnderlyingElement().parentElement!, this.icon, this.description);
    }
}