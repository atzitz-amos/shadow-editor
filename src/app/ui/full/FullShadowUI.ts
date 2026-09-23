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
import {IdeDialog} from "../../../core/ui/lib/dialog/IdeDialog";
import {UIHooks} from "../../../core/ui/engine/listeners/hooks/UIHooks";
import {UICommonHooks} from "../../core/UICommonHooks";


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
    private readonly myDialogLayer: HTMLElement;
    private activeDialog: IdeDialog | null = null;

    constructor(root: HTMLElement) {
        this.root = root;
        this.myTaskbar = new ShadowTaskbar(root);

        const mainContent = HTMLUtils.createElement("main.shell-main", root);

        this.myLeftActionRail = new SLeftActionRail(mainContent);
        this.myWorkspace = new SEditorWorkspace(mainContent);
        this.myFooter = new SFooter(root);

        this.myDialogLayer = HTMLUtils.createElement("div.ide-popup-layer.no-popup", root);

        this.myDialogLayer.addEventListener("mousedown", (event) => {
            if (this.activeDialog && !this.activeDialog.containsXY(event.x, event.y)) this.cancelDialog();
        });

        this.myDialogLayer.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this.cancelDialog();
            }
        });

        document.addEventListener("focusin", e => {
            UIHooks.trigger(UICommonHooks.FOCUS_CHANGE, e.relatedTarget, e.target);
        });
    }

    getTaskbar(): ShadowTaskbar {
        return this.myTaskbar;
    }

    getLeftActionRail(): SLeftActionRail {
        return this.myLeftActionRail;
    }

    getWorkspace(): SEditorWorkspace {
        return this.myWorkspace;
    }

    getFooter(): SFooter {
        return this.myFooter;
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
        GlobalState.getMainEventBus().syncPublish(new UIResizeEvent());
        window.addEventListener("resize", () => {
        });
    }

    showDialog(dialog: IdeDialog) {
        if (this.activeDialog) {
            this.activeDialog.close(true);
        }

        this.activeDialog = dialog;

        this.myDialogLayer.classList.remove("no-popup");
        if (dialog.isTransparent()) {
            this.myDialogLayer.classList.add("transparent");
        } else {
            this.myDialogLayer.classList.remove("transparent");
        }

        dialog.open(this.myDialogLayer);

        dialog.onClose(() => {
            if (this.activeDialog === dialog) {
                this.activeDialog = null;
                this.myDialogLayer.classList.add("no-popup");
            }
        });
    }

    cancelDialog() {
        if (this.activeDialog) {
            this.activeDialog.close(true);
            this.activeDialog = null;
        }

        this.myDialogLayer.classList.add("no-popup");
    }

    getActiveDialog(): IdeDialog | null {
        return this.activeDialog;
    }
}
