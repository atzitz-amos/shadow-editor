import {Taskbar} from "./taskbar/Taskbar";
import {ShadowApp} from "../ShadowApp";

/**
 * Represents the main app UI
 *
 * @author Atzitz Amos
 * @date 11/6/2025
 * @since 1.0.0
 */
export class ShadowUI {
    private static instance: ShadowUI;

    private myApp: ShadowApp;

    private renderingProcess: any;

    private myTaskbar: Taskbar;

    private constructor() {
        this.myTaskbar = new Taskbar();
    }

    public static launch(app: ShadowApp): void {
        if (ShadowUI.instance) {
            console.error("ShadowUI has already been launched!");
            return;
        }
        ShadowUI.getRunningInstance().launch(app);
    }

    public static getRunningInstance(): ShadowUI {
        if (!ShadowUI.instance) {
            this.instance = new ShadowUI();
        }
        return ShadowUI.instance;
    }

    private launch(app: ShadowApp) {
        this.renderingProcess = setInterval(this.eventLoop.bind(this));
        this.myApp = app;
    }

    private eventLoop() {

    }
}
