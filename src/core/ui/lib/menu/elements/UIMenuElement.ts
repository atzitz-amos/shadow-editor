import {UIMenu} from "../UIMenu";
import {UIComponent} from "../../../engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export abstract class UIMenuElement extends UIComponent {
    protected menu: UIMenu;

    protected isDisabled: boolean = false;

    abstract draw(data?: any): void;

    init(menu: UIMenu): void {
        this.menu = menu;
    }

    disable(): void {
        this.isDisabled = true;
    }

    enable(): void {
        this.isDisabled = false;
    }
}
