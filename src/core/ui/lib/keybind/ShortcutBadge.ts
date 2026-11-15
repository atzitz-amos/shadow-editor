import {UIComponent} from "../../engine/components/UIComponent";
import {Key, Keybind} from "../../../keybinds/Keybind";
import {HTMLUtils} from "../../../utils/HTMLUtils";
import {CustomElementsRegistry} from "../CustomElementsRegistry";
import {KeybindManager} from "../../../keybinds/KeybindManager";

const KEY_LABELS: Partial<Record<Key, string>> = {
    [Key.ARROW_UP]: "↑",
    [Key.ARROW_DOWN]: "↓",
    [Key.ARROW_LEFT]: "←",
    [Key.ARROW_RIGHT]: "→",
    [Key.SPACE]: "Space",
    [Key.LeftClick]: "LClick",
    [Key.RightClick]: "RClick",
};

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

    /** The text shown for a keybind, such as "Ctrl+Shift+F" */
    public static format(shortcut: Keybind): string {
        let shortcutText: string = "";
        if (shortcut.ctrl) {
            shortcutText += "Ctrl+";
        }
        if (shortcut.alt) {
            shortcutText += "Alt+";
        }
        if (shortcut.shift) {
            shortcutText += "Shift+";
        }

        const rawKey = shortcut.key;
        let formattedKey = KEY_LABELS[rawKey] || String(rawKey);

        if (formattedKey.length === 1) {
            formattedKey = formattedKey.toUpperCase();
        } else if (formattedKey.startsWith("Numpad")) {
            formattedKey = "Num" + formattedKey.slice(6, 7).toUpperCase() + formattedKey.slice(7);
        }

        return shortcutText + formattedKey;
    }

    /**
     * Parses a keybind written as modifiers and a key separated by "+", such as "Ctrl+Shift+F" or "Alt+ArrowUp".
     * The key is either a {@link Key} value, a {@link Key} name or the label shown by {@link format}, in any case.
     *
     * @returns null when the key is unknown
     */
    public static parse(text: string): Keybind | null {
        const parts = text.split("+").map(part => part.trim().toLowerCase());
        const keyName = parts.pop();
        if (!keyName) return null;

        const key = (Object.entries(Key) as [string, Key][]).find(([name, value]) =>
            value.toLowerCase() === keyName
            || name.toLowerCase() === keyName
            || KEY_LABELS[value]?.toLowerCase() === keyName)?.[1];
        if (key === undefined) return null;

        return {
            key,
            ctrl: parts.includes("ctrl") || parts.includes("control"),
            alt: parts.includes("alt"),
            shift: parts.includes("shift")
        };
    }

    public draw(): void {
        this.setInnerHTML(ShortcutBadge.format(this.shortcut));
    }
}

/**
 * {@code <ide-shortcut keys="Ctrl+Shift+F">} or {@code <ide-shortcut action="action.id">}: the badge of a keybind,
 * given either directly or as the effective keybind of an action. The element itself is the badge.
 */
class _CustomIdeShortcut extends HTMLElement {
    static get observedAttributes() {
        return ["keys", "action"];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        if (this.isConnected) this.render();
    }

    private render() {
        const keys = this.getAttribute("keys");
        const action = this.getAttribute("action");

        const keybind = keys !== null ? ShortcutBadge.parse(keys)
            : action !== null ? KeybindManager.getInstance().getEffectiveKeybind(action) ?? null
                : null;
        this.textContent = keybind ? ShortcutBadge.format(keybind) : keys ?? "";
    }
}

CustomElementsRegistry.register("ide-shortcut", _CustomIdeShortcut);
