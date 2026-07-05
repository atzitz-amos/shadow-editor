import {UIComponent} from "../../engine/components/UIComponent";
import {Key, Keybind} from "../../../keybinds/Keybind";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";

/**
 *
 * @author Atzitz Amos
 * @date 6/4/2026
 * @since 1.0.0
 */
export class ShortcutBadge extends UIComponent {

    public constructor(root: HTMLElement, private shortcut: Keybind) {
        super(HTMLUtils.createElement("span.ui-shortcut-badge", root));
    }

    public draw(): void {
        let shortcutText: string = "";
        if (this.shortcut.ctrl) {
            shortcutText += "Ctrl+";
        }
        if (this.shortcut.alt) {
            shortcutText += "Alt+";
        }
        if (this.shortcut.shift) {
            shortcutText += "Shift+";
        }

        const keyMap: Partial<Record<Key, string>> = {
            [Key.ARROW_UP]: "↑",
            [Key.ARROW_DOWN]: "↓",
            [Key.ARROW_LEFT]: "←",
            [Key.ARROW_RIGHT]: "→",
            [Key.SPACE]: "Space",
            [Key.LeftClick]: "LClick",
            [Key.RightClick]: "RClick",
        };
        const rawKey = this.shortcut.key;
        let formattedKey = keyMap[rawKey] || String(rawKey);

        if (formattedKey.length === 1) {
            formattedKey = formattedKey.toUpperCase();
        } else if (formattedKey.startsWith("Numpad")) {
            formattedKey = "Num" + formattedKey.slice(6, 7).toUpperCase() + formattedKey.slice(7);
        }

        shortcutText += formattedKey;
        this.setInnerHTML(shortcutText);
    }
}
