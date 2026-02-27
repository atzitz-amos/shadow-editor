import {ShadowApp} from "../ShadowApp";
import {LaunchComponent} from "./launch/LaunchComponent";

/**
 * Represents the main app UI
 *
 * @author Atzitz Amos
 * @date 11/6/2025
 * @since 1.0.0
 */
export class ShadowUI {
    private static instance: ShadowUI;

    private _myApp: ShadowApp;

    private constructor() {
    }

    public static singleEditorUI() {

    }

    public static showLaunchComponent(): void {
        ShadowUI.getRunningInstance().showLaunchComponent();
    }

    public static getRunningInstance(): ShadowUI {
        if (!ShadowUI.instance) {
            this.instance = new ShadowUI();
        }
        return ShadowUI.instance;
    }

    public getApp(): ShadowApp {
        if (!this._myApp) {
            this._myApp = ShadowApp.getInstance();
        }
        return this._myApp;
    }

    private showLaunchComponent() {
        LaunchComponent.showSplashScreen(this);
    }
}
