import {UIMenuElement} from "./elements/UIMenuElement";
import {UIMenuAction} from "./elements/UIMenuAction";
import {Icon} from "../../icons/Icon";
import {Keybind} from "../../../keybinds/Keybind";
import {ActionGroup} from "../../../actions/group/ActionGroup";
import {AbstractAction} from "../../../actions/AbstractAction";
import {KeybindContext} from "../../../keybinds/context/KeybindContext";

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

    addAction(label: string, action: ((context?: KeybindContext | null) => void) | AbstractAction, icon: Icon | null = null, shortcut: Keybind | null = null): this {
        return this.addMenuElement(new UIMenuAction(label, icon, action, shortcut));
    }

    setGroup(group: ActionGroup | string): this {
        if (typeof group === "string") {
            const id = group;
            group = ActionGroup.getInstance(group) as ActionGroup;
            if (!group) throw new Error(`Action group with id '${id}' not found`);
        }
        for (const action of group.getActions()) {
            this.addAction(action.getName(), action, null, action.getDefaultKeybinding());
        }
        return this;
    }

    getContext(): KeybindContext | null {
        return null;
    }

    getElements(): UIMenuElement[] {
        return this.elements;
    }

    abstract open(): void;

    abstract close(): void;
}
