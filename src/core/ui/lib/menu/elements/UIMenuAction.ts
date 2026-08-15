import {Icon} from "../../../icons/Icon";
import {Keybind} from "../../../../keybinds/Keybind";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {ShortcutBadge} from "../../keybind/ShortcutBadge";
import {UIMenuElement} from "./UIMenuElement";
import {UIMenu} from "../UIMenu";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class UIMenuAction extends UIMenuElement {
    public constructor(private readonly label: string,
                       private readonly icon: Icon | null = null,
                       private readonly action: () => void,
                       private readonly shortcut: Keybind | null = null) {
        super(HTMLUtils.createElement("button.ui-menu-action"));
    }

    draw(): void {
        this.setInnerHTML("");

        if (this.icon)
            this.addChild(this.icon);
        this.insertHTML(`<span class='ui-dropdown-menu-item-label'>${this.label}</span>`)

        if (this.shortcut) {
            this.addChild(new ShortcutBadge(this.getUnderlyingElement(), this.shortcut));
        }

        this.drawChildren();

        this.getUnderlyingElement().addEventListener("click", () => this.invoke());
    }

    init(menu: UIMenu) {
        super.init(menu);
    }

    invoke() {
        this.action();
        this.menu.close();
    }
}
