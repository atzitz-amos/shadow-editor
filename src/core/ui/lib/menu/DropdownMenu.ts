import {UIComponent} from "../../engine/components/UIComponent";
import {Icon} from "../../icons/Icon";
import {FaIcon} from "../../icons/FaIcon";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {Keybind} from "../../../keybinds/Keybind";
import {ShortcutBadge} from "./ShortcutBadge";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class DropdownMenu extends UIComponent {
    private readonly icon: Icon;
    private readonly description: string;
    private readonly elements: UIComponent[] = [];

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

        const menuList = HTMLUtils.createElement("div.ui-dropdown-menu-list", this.getUnderlyingElement());
        for (const element of this.elements) {
            this.addChildTo(element, menuList);
        }

        this.addHtmlElement(summary);
        this.addHtmlElement(menuList);

        this.drawChildren();
    }

    close() {
        (this.getUnderlyingElement() as HTMLDetailsElement).open = false;
    }

    addElement(element: DropdownMenuElement): DropdownMenu {
        this.elements.push(element);
        element.init(this);
        this.addChild(element);
        return this;
    }

    addAction(label: string, action: () => void, icon: Icon | null = null, shortcut: Keybind | null = null): DropdownMenu {
        return this.addElement(new DropdownAction(label, icon, action, shortcut));
    }
}

export abstract class DropdownMenuElement extends UIComponent {
    abstract init(menu: DropdownMenu): void;
}

export class DropdownAction extends DropdownMenuElement {
    private menu: DropdownMenu;

    public constructor(private readonly label: string,
                       private readonly icon: Icon | null = null,
                       private readonly action: () => void,
                       private readonly shortcut: Keybind | null = null) {
        super(HTMLUtils.createElement("button.ui-dropdown-action"));
    }

    init(menu: DropdownMenu): void {
        this.menu = menu;
    }

    draw(): void {
        this.setInnerHTML("");

        if (this.icon)
            this.addChild(this.icon);
        this.insertHTML(`<span class='ui-dropdown-menu-item-label'>${this.label}</span>`)

        if (this.shortcut)
            this.addChild(new ShortcutBadge(this.getUnderlyingElement(), this.shortcut));

        this.drawChildren();

        this.getUnderlyingElement().addEventListener("click", () => {
            this.action();
            this.menu.close();
        });
    }
}