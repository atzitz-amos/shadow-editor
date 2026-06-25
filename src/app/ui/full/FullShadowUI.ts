import {ShadowUI} from "../ShadowUI";
import {ShadowTaskbar} from "./layout/taskbar/ShadowTaskbar";
import {SFooter} from "./layout/footer/SFooter";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";
import {SLeftActionRail} from "./layout/rail/SLeftActionRail";
import {SEditorWorkspace} from "./layout/workspace/SEditorWorkspace";
import {GlobalState} from "../../../core/global/GlobalState";
import {UIResizeEvent} from "../../core/events/UIResizeEvent";
import {Editor} from "../../../editor/Editor";
import {UICommonKeys} from "../../core/UICommonKeys";
import {IdePopup} from "../../../core/ui/lib/popup/IdePopup";


/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export class FullShadowUI implements ShadowUI {
    private readonly myTaskbar: ShadowTaskbar;
    private readonly myLeftActionRail: SLeftActionRail;
    private readonly myWorkspace: SEditorWorkspace;
    private readonly myFooter: SFooter;
    private readonly root: HTMLElement;

    private readonly myPopupLayer: HTMLElement;
    private activePopup: IdePopup | null = null;

    constructor(root: HTMLElement) {
        this.root = root;
        this.myTaskbar = new ShadowTaskbar(root);

        const mainContent = HTMLUtils.createElement("main.shell-main", root);

        this.myLeftActionRail = new SLeftActionRail(mainContent);
        this.myWorkspace = new SEditorWorkspace(mainContent);
        this.myFooter = new SFooter(root);

        this.myPopupLayer = HTMLUtils.createElement("div.ide-popup-layer.no-popup", root);

        this.myPopupLayer.addEventListener("mousedown", (event) => {
            if (this.activePopup && !this.activePopup.containsXY(event.x, event.y)) this.cancelPopup();
        });

        this.myPopupLayer.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this.cancelPopup();
            }
        });
    }

    getMainEditor(): Editor {
        return this.myWorkspace.getCommonKey(UICommonKeys.MAIN_EDITOR)!;
    }

    draw(): void {
        this.myTaskbar.draw();
        this.myLeftActionRail.draw();
        this.myWorkspace.draw();
        this.myFooter.draw();
    }

    addEventListeners() {
        window.addEventListener("resize", () => {
            GlobalState.getMainEventBus().syncPublish(new UIResizeEvent());
        });
    }

    showPopup(popup: IdePopup) {
        if (this.activePopup) {
            this.activePopup.close(true);
        }

        this.activePopup = popup;
        this.myPopupLayer.classList.remove("no-popup");

        popup.open(this.myPopupLayer);
    }

    cancelPopup() {
        if (this.activePopup) {
            this.activePopup.close(true);
            this.activePopup = null;
        }

        this.myPopupLayer.classList.add("no-popup");
    }
}
