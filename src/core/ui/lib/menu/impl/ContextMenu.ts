import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIMenu} from "../UIMenu";
import {Keybind} from "../../../../keybinds/Keybind";
import {KeybindManager} from "../../../../keybinds/KeybindManager";

/**
 *
 * @author Atzitz Amos
 * @date 8/5/2026
 * @since 1.0.0
 */
export class ContextMenu extends UIMenu {
    private static readonly menuRoot: HTMLElement = HTMLUtils.createElement("div.ui-context-menu");
    private static opened: boolean = false;

    private openCallback: null | (() => void) = null;
    private keybindActions: [Keybind, () => void][] = [];

    constructor(private readonly attachedElement: HTMLElement) {
        super();

        this.setup();
    }

    private static readonly closeHandler = () => {
        this.menuRoot.style.display = "none";
        this.opened = false;
    }

    static {
        window.addEventListener("load", () => {
            document.body.appendChild(this.menuRoot)
            document.body.addEventListener("keydown", this.escapeListener)
            document.body.addEventListener("click", this.closeHandler)

            this.menuRoot.style.display = "none";
        }, false);
    }

    private static readonly escapeListener = (e: KeyboardEvent) => {
        if (e.key === "Escape") this.closeHandler();
    };

    private static readonly clickListener = (e: MouseEvent) => this.closeHandler();

    registerKeybind(keybind: Keybind, command: () => void): void {
        this.keybindActions.push([keybind, command]);
    }

    setOpenCallback(callback: () => void): this {
        this.openCallback = callback;
        return this;
    }

    open(x?: number, y?: number): void {
        this.openCallback?.();

        const menuRoot = ContextMenu.menuRoot;
        menuRoot.innerHTML = "";
        menuRoot.style.display = "block";

        for (const element of this.elements) {
            menuRoot.appendChild(element.getUnderlyingElement());
            element.draw();
        }

        const bbox = this.attachedElement.getBoundingClientRect();
        if (x === undefined)
            x = bbox.x + bbox.width / 2;
        if (y === undefined)
            y = bbox.y + bbox.height / 2;

        const menuBBox = menuRoot.getBoundingClientRect();
        HTMLUtils.attachAt(menuRoot, x, y, menuBBox.width, menuBBox.height, "SE");

        ContextMenu.opened = true;
    }

    close() {
        ContextMenu.closeHandler();
    }


    private setup() {
        this.attachedElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.open(e.clientX, e.clientY);
        });

        this.attachedElement.addEventListener("keydown", e => {
            for (const [keybind, command] of this.keybindActions) {
                if (KeybindManager.eventMatchesKeybind(keybind, e)) {
                    e.preventDefault();
                    command();
                }
            }
        });
    }
}
