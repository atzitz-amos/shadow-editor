import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIMenu} from "../UIMenu";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export type ContextMenu<T> = (data: T, contextMenu: ContextMenuElement) => void;


class ContextMenuSingleton {
    public static readonly menuRoot: HTMLElement = HTMLUtils.createElement("div.ui-context-menu");

    static {
        window.addEventListener("load", () => {
            document.body.appendChild(this.menuRoot)
            document.body.addEventListener("keydown", this.escapeListener)
            document.body.addEventListener("click", this.closeHandler)

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

    constructor() {
        super();
    }

    static open<T>(x: number, y: number, entry: T, contextMenu: ContextMenu<T>) {
        const menu = new ContextMenuElement();
        contextMenu(entry, menu);
        menu.open(x, y);
    }

    open(x?: number, y?: number): void {
        if (!this.elements.length) return;

        const menuRoot = ContextMenuSingleton.getInstance();
        menuRoot.innerHTML = "";
        menuRoot.style.display = "block";

        for (const element of this.elements) {
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