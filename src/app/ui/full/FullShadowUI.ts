import {ShadowUI} from "../ShadowUI";
import {ShadowTaskbar} from "./layout/taskbar/ShadowTaskbar";
import {SFooter} from "./layout/footer/SFooter";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";
import {SLeftActionRail} from "./layout/rail/SLeftActionRail";
import {SEditorWorkspace} from "./layout/workspace/SEditorWorkspace";
import {GlobalState} from "../../../core/global/GlobalState";
import {UIResizeEvent} from "../events/UIResizeEvent";
import {Editor} from "../../../editor/Editor";
import {UICommonKeys} from "../keys/UICommonKeys";


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

    constructor(root: HTMLElement) {
        this.root = root;
        this.myTaskbar = new ShadowTaskbar(root);

        const mainContent = HTMLUtils.createElement("main.shell-main", root);

        this.myLeftActionRail = new SLeftActionRail(mainContent);
        this.myWorkspace = new SEditorWorkspace(mainContent);
        this.myFooter = new SFooter(root);
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
}
