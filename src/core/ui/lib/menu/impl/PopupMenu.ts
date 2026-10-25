import {UIMenu} from "../UIMenu";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {KeybindContext} from "../../../../keybinds/context/KeybindContext";
import {UIMenuAction} from "../elements/UIMenuAction";
import {UIMenuSeparator} from "../elements/UIMenuSeparator";
import {UIMenuHeader} from "../elements/UIMenuHeader";

/**
 * Where the menu opens relative to its anchor: below or above it, aligned on its start (left) or end (right) edge.
 * The menu flips vertically when it does not fit in the viewport.
 */
export type PopupMenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

/**
 * Fills a freshly created menu right before it opens, so that its content can depend on the current state.
 */
export type PopupMenuBuilder = (menu: PopupMenu) => void;

export type PopupMenuOptions = {
    placement?: PopupMenuPlacement,
    /** Gap between the anchor and the menu, in pixels */
    offset?: number,
    /** Additional css class of the menu element */
    className?: string,
    /** Context passed to the actions of the menu */
    context?: KeybindContext | null,
    /** Focus the first action when opening, defaults to true */
    autoFocus?: boolean
}

/**
 * A menu anchored to an element, such as a button. Only one popup menu is open at a time; it closes on Escape,
 * on outside clicks, on scroll and resize, and once an action ran. Arrow keys, Home and End move between actions.
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class PopupMenu extends UIMenu {
    private static current: PopupMenu | null = null;

    private readonly element: HTMLElement;
    private readonly closeListeners: (() => void)[] = [];
    private readonly disposers: (() => void)[] = [];
    private opened: boolean = false;

    public constructor(private readonly anchor: HTMLElement, private readonly options: PopupMenuOptions = {}) {
        super();
        this.element = HTMLUtils.createDiv("ui-popup-menu");
        if (options.className) this.element.classList.add(...options.className.split(" "));
    }

    /**
     * Creates a menu anchored to the element, fills it with the builder and opens it.
     */
    public static openAt(anchor: HTMLElement, builder: PopupMenuBuilder, options: PopupMenuOptions = {}): PopupMenu {
        const menu = new PopupMenu(anchor, options);
        builder(menu);
        menu.open();
        return menu;
    }

    public static getCurrent(): PopupMenu | null {
        return this.current;
    }

    addSeparator(): this {
        return this.addMenuElement(new UIMenuSeparator());
    }

    addHeader(text: string): this {
        return this.addMenuElement(new UIMenuHeader(text));
    }

    getContext(): KeybindContext | null {
        return this.options.context ?? null;
    }

    getAnchor(): HTMLElement {
        return this.anchor;
    }

    getElement(): HTMLElement {
        return this.element;
    }

    isOpen(): boolean {
        return this.opened;
    }

    onClose(listener: () => void): this {
        this.closeListeners.push(listener);
        return this;
    }

    open(): void {
        if (this.opened) return;
        PopupMenu.current?.close();

        this.element.innerHTML = "";
        for (const element of this.elements) {
            if (element instanceof UIMenuAction && !element.isApplicable()) continue;
            this.element.appendChild(element.getUnderlyingElement());
            element.draw();
        }
        if (!this.element.querySelector(".ui-menu-action")) return;

        document.body.appendChild(this.element);
        this.position();

        this.opened = true;
        PopupMenu.current = this;
        this.listen();

        if (this.options.autoFocus ?? true) this.getActions()[0]?.focus();
    }

    close(): void {
        if (!this.opened) return;
        this.opened = false;
        if (PopupMenu.current === this) PopupMenu.current = null;

        this.disposers.forEach(dispose => dispose());
        this.disposers.length = 0;
        this.element.remove();

        this.closeListeners.forEach(listener => listener());
    }

    private getActions(): HTMLElement[] {
        return [...this.element.querySelectorAll<HTMLElement>(".ui-menu-action")];
    }

    private position() {
        const placement = this.options.placement ?? "bottom-end";
        const offset = this.options.offset ?? 4;
        const anchor = this.anchor.getBoundingClientRect();
        const menu = this.element.getBoundingClientRect();

        let top = placement.startsWith("bottom") ? anchor.bottom + offset : anchor.top - menu.height - offset;
        if (top + menu.height > window.innerHeight - 4 && placement.startsWith("bottom")) {
            top = anchor.top - menu.height - offset;
        } else if (top < 4 && placement.startsWith("top")) {
            top = anchor.bottom + offset;
        }

        let left = placement.endsWith("end") ? anchor.right - menu.width : anchor.left;
        left = Math.max(4, Math.min(left, window.innerWidth - menu.width - 4));

        this.element.style.top = HTMLUtils.px(Math.max(4, top));
        this.element.style.left = HTMLUtils.px(left);
    }

    private listen() {
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node;
            // The anchor toggles the menu itself
            if (!this.element.contains(target) && !this.anchor.contains(target)) this.close();
        };
        const onKeydown = (e: KeyboardEvent) => this.onKeydown(e);
        const onViewportChange = (e: Event) => {
            if (e.type === "scroll" && this.element.contains(e.target as Node)) return;
            this.close();
        };
        // An action ran: UIMenuAction closes the menu itself, this covers custom elements
        const onClick = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest(".ui-menu-action")) queueMicrotask(() => this.close());
        };

        document.addEventListener("pointerdown", onPointerDown, true);
        window.addEventListener("resize", onViewportChange);
        window.addEventListener("scroll", onViewportChange, true);
        this.element.addEventListener("keydown", onKeydown);
        this.element.addEventListener("click", onClick);
        this.element.addEventListener("mouseover", e => {
            (e.target as HTMLElement).closest<HTMLElement>(".ui-menu-action")?.focus();
        });

        this.disposers.push(() => {
            document.removeEventListener("pointerdown", onPointerDown, true);
            window.removeEventListener("resize", onViewportChange);
            window.removeEventListener("scroll", onViewportChange, true);
        });
    }

    private onKeydown(e: KeyboardEvent) {
        const actions = this.getActions();
        const index = actions.indexOf(document.activeElement as HTMLElement);

        switch (e.key) {
            case "ArrowDown":
                actions[(index + 1) % actions.length]?.focus();
                break;
            case "ArrowUp":
                actions[(index - 1 + actions.length) % actions.length]?.focus();
                break;
            case "Home":
                actions[0]?.focus();
                break;
            case "End":
                actions[actions.length - 1]?.focus();
                break;
            case "Escape":
                this.close();
                (this.anchor.matches("button, [tabindex]") ? this.anchor : this.anchor.querySelector("button"))?.focus();
                break;
            case "Tab":
                this.close();
                return;
            default:
                return;
        }
        e.preventDefault();
        e.stopPropagation();
    }
}
