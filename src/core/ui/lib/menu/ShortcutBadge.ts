import {UIComponent} from "../../engine/components/UIComponent";
import {Keybind} from "../../../keybinds/Keybind";
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
        } if (this.shortcut.alt) {
            shortcutText += "Alt+";
        } if (this.shortcut.shift) {
            shortcutText += "Shift+";
        }
        shortcutText += this.shortcut.key.toUpperCase();
        this.setInnerHTML(shortcutText);
    }

}
