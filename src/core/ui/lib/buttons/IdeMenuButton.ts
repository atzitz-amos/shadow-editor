import {UIComponent} from "../../engine/components/UIComponent";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {Icon} from "../../icons/Icon";
import {UIVariant} from "../theme/UIVariant";
import {PopupMenu, PopupMenuBuilder, PopupMenuPlacement} from "../menu/impl/PopupMenu";
import {KeybindContext} from "../../../keybinds/context/KeybindContext";

export type IdeMenuButtonOptions = {
    icon?: Icon | null,
    label?: string | null,
    tooltip?: string | null,
    /** Ghost buttons are borderless icon buttons, as used in toolbars. Defaults to ghost */
    variant?: UIVariant | "ghost",
    size?: "small" | "normal",
    placement?: PopupMenuPlacement,
    /** Shows the small triangle hinting that the button opens a menu. Defaults to true */
    showIndicator?: boolean,
    /**
     * Turns the button into a split button: clicking it runs this action, and only the arrow
     * next to it opens the menu.
     */
    primaryAction?: (() => void) | null,
    /** Additional css class of the menu */
    menuClassName?: string,
    /** Context passed to the actions of the menu */
    context?: (() => KeybindContext | null) | null
}

/**
 * A button opening a {@link PopupMenu} anchored to it. The menu is rebuilt by the builder every time it opens.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class IdeMenuButton extends UIComponent {
    private menu: PopupMenu | null = null;
    private disabled: boolean = false;

    public constructor(private builder: PopupMenuBuilder, private readonly options: IdeMenuButtonOptions = {}) {
        super(HTMLUtils.createElement("span.ide-menu-button"));
    }

    public draw(): void {
        const root = this.getUnderlyingElement();
        const variant = this.options.variant ?? "ghost";
        const split = !!this.options.primaryAction;

        root.innerHTML = "";
        root.className = "ide-menu-button";
        root.classList.add(variant === "ghost" ? "ghost" : variant, this.options.size ?? "normal");
        root.classList.toggle("split", split);
        root.classList.toggle("icon-only", !this.options.label);
        root.classList.toggle("open", this.isOpen());

        const main = HTMLUtils.createElement<HTMLButtonElement>("button.ide-menu-button-main", root);
        main.type = "button";
        main.disabled = this.disabled;
        if (this.options.tooltip) main.title = this.options.tooltip;

        if (this.options.icon) main.appendChild(this.options.icon.toHTML());
        if (this.options.label) {
            HTMLUtils.createElement("span.ide-menu-button-label", main).textContent = this.options.label;
        }

        if (split) {
            main.addEventListener("click", () => this.options.primaryAction!());

            const arrow = HTMLUtils.createElement<HTMLButtonElement>("button.ide-menu-button-arrow", root);
            arrow.type = "button";
            arrow.disabled = this.disabled;
            arrow.title = "More options";
            arrow.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
            arrow.addEventListener("click", () => this.toggle());
        } else {
            main.setAttribute("aria-haspopup", "menu");
            main.addEventListener("click", () => this.toggle());
            main.addEventListener("keydown", e => {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    this.open();
                }
            });
            if (this.options.showIndicator ?? true) {
                HTMLUtils.createElement("span.ide-menu-button-indicator", main);
            }
        }
    }

    public open(): void {
        if (this.disabled || this.isOpen()) return;

        const anchor = this.getUnderlyingElement();
        const menu = new PopupMenu(anchor, {
            placement: this.options.placement ?? "bottom-end",
            className: this.options.menuClassName,
            context: this.options.context?.() ?? null
        });
        this.builder(menu);
        menu.onClose(() => {
            if (this.menu === menu) this.menu = null;
            anchor.classList.remove("open");
        });

        this.menu = menu;
        menu.open();
        // Nothing to show: the menu did not open
        if (!menu.isOpen()) {
            this.menu = null;
            return;
        }
        anchor.classList.add("open");
    }

    public close(): void {
        this.menu?.close();
    }

    public toggle(): void {
        if (this.isOpen()) this.close();
        else this.open();
    }

    public isOpen(): boolean {
        return this.menu?.isOpen() ?? false;
    }

    public setBuilder(builder: PopupMenuBuilder): void {
        this.builder = builder;
    }

    public setEnabled(enabled: boolean): void {
        this.disabled = !enabled;
        if (!enabled) this.close();
        this.getUnderlyingElement().querySelectorAll("button").forEach(button => button.disabled = !enabled);
    }

    public dispose(): void {
        this.close();
        super.dispose();
    }
}
