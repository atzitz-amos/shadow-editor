import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIMenu} from "../UIMenu";
import {KeybindContext} from "../../../../keybinds/context/KeybindContext";
import {ContextResolver} from "../../../../keybinds/context/ContextResolver";
import {KeybindEventLike} from "../../../../keybinds/context/KeybindEventLike";
import {UIMenuAction} from "../elements/UIMenuAction";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export type ContextMenu = (contextMenu: ContextMenuElement) => void;


class ContextMenuSingleton {
    public static readonly menuRoot: HTMLElement = HTMLUtils.createElement("div.ui-context-menu");
    private static readonly outsidePointerDownListener = (e: PointerEvent) => {
        if (this.menuRoot.style.display === "none") return;
        if (!this.menuRoot.contains(e.target as Node)) this.closeHandler();
    };

    static {
        window.addEventListener("load", () => {
            document.body.appendChild(this.menuRoot)
            document.body.addEventListener("keydown", this.escapeListener)
            document.body.addEventListener("click", this.closeHandler)
            document.addEventListener("pointerdown", this.outsidePointerDownListener, true);

            this.menuRoot.style.display = "none";
        }, false);
    }

    public static readonly closeHandler = () => {
        this.menuRoot.style.display = "none";
    }

    public static readonly escapeListener = (e: KeyboardEvent) => {
        if (e.key === "Escape") this.closeHandler();
    };

    static getInstance() {
        return this.menuRoot;
    }
}

export class ContextMenuElement extends UIMenu {
    private opened: boolean = false;
    private context: KeybindContext | null = null;

    constructor() {
        super();
    }

    static open<T>(x: number, y: number, contextMenu: ContextMenu, event?: KeybindEventLike & {target?: EventTarget | null}) {
        const menu = new ContextMenuElement();
        menu.context = event ? ContextResolver.fromEvent(event) : null;
        contextMenu(menu);
        menu.open(x, y);
    }

    getContext(): KeybindContext | null {
        return this.context;
    }

    open(x?: number, y?: number): void {
        if (!this.elements.length) return;

        const menuRoot = ContextMenuSingleton.getInstance();
        menuRoot.innerHTML = "";
        menuRoot.style.display = "block";

        for (const element of this.elements) {
            if (element instanceof UIMenuAction && !element.isApplicable()) continue;
            menuRoot.appendChild(element.getUnderlyingElement());
            element.draw();
        }

        if (x === undefined)
            x = 0;
        if (y === undefined)
            y = 0;

        const menuBBox = menuRoot.getBoundingClientRect();
        HTMLUtils.attachAt(menuRoot, x, y, menuBBox.width, menuBBox.height, "SE");

        this.opened = true;
    }

    close() {
        if (!this.opened) return;
        this.opened = false;
        ContextMenuSingleton.closeHandler();
    }
}