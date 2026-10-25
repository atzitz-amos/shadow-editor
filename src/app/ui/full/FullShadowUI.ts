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
    // Open dialogs, bottom to top: only the last one reacts to outside clicks and Escape
    private readonly dialogStack: IdeDialog[] = [];

    constructor(root: HTMLElement) {
        this.root = root;
        this.myTaskbar = new ShadowTaskbar(root);

        const mainContent = HTMLUtils.createElement("main.shell-main", root);

        this.myLeftActionRail = new SLeftActionRail(mainContent);
        this.myWorkspace = new SEditorWorkspace(mainContent);
        this.myFooter = new SFooter(root);

        this.myDialogLayer = HTMLUtils.createElement("div.ide-popup-layer.no-popup", root);

        this.myDialogLayer.addEventListener("mousedown", (event) => {
            const top = this.getActiveDialog();
            if (top && top.isClosedOnOutsideClick() && !top.containsXY(event.x, event.y)) this.cancelDialog();
        });

        // Remember the topmost dialog before the event reaches it: some dialogs close themselves on Escape,
        // and the dialog underneath must not be closed by that same key press once it becomes the topmost one
        let escapeTarget: IdeDialog | null = null;
        this.myDialogLayer.addEventListener("keydown", (event) => {
            if (event.key === "Escape") escapeTarget = this.getActiveDialog();
        }, true);

        this.myDialogLayer.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && escapeTarget && escapeTarget.isOpen() && escapeTarget.isClosedOnEscape()) {
                escapeTarget.close(true);
            }
            escapeTarget = null;
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

    /**
     * Opens the dialog on top of the already opened ones. An opened dialog of the same class is closed first,
     * so that triggering the same dialog twice replaces it instead of stacking a copy.
     */
    showDialog(dialog: IdeDialog) {
        for (const opened of [...this.dialogStack]) {
            if (opened.constructor === dialog.constructor) opened.close(true);
        }

        this.dialogStack.push(dialog);
        dialog.open(this.myDialogLayer);

        dialog.onClose(() => {
            const index = this.dialogStack.indexOf(dialog);
            if (index !== -1) this.dialogStack.splice(index, 1);
            this.updateDialogLayer();
        });

        this.updateDialogLayer();
    }

    cancelDialog() {
        this.getActiveDialog()?.close(true);
    }

    getActiveDialog(): IdeDialog | null {
        return this.dialogStack.at(-1) ?? null;
    }

    getOpenDialogs(): IdeDialog[] {
        return [...this.dialogStack];
    }

    private updateDialogLayer() {
        const top = this.getActiveDialog();

        this.myDialogLayer.classList.toggle("no-popup", top === null);
        this.myDialogLayer.classList.toggle("transparent", top !== null && top.isTransparent());
    }
}
