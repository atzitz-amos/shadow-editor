import {UIMenuElement} from "./elements/UIMenuElement";
import {UIMenuAction} from "./elements/UIMenuAction";
import {Icon} from "../../icons/Icon";
import {Keybind} from "../../../keybinds/Keybind";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export abstract class UIMenu {
    protected readonly elements: UIMenuElement[] = []

    addMenuElement(element: UIMenuElement): this {
        this.elements.push(element);
        element.init(this);
        return this;
    }

    addAction(label: string, action: () => void, icon: Icon | null = null, shortcut: Keybind | null = null): this {
        return this.addMenuElement(new UIMenuAction(label, icon, action, shortcut));
    }

    getElements(): UIMenuElement[] {
        return this.elements;
    }

    abstract open(): void;

    abstract close(): void;
}
