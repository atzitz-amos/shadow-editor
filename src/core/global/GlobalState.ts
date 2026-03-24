import {ShadowApp} from "../../app/ShadowApp";
import {ShadowUIFactory} from "../../app/ui/ShadowUIFactory";
import {Workspace} from "../workspace/Workspace";
import {GlobalProject} from "./GlobalProject";
import {EventBus} from "../events/EventBus";
import {PluginManager} from "../plugins/PluginManager";
import {LangSupport} from "../lang/LangSupport";
import {SettingsManager} from "../settings/SettingsManager";
import {ActionManager} from "../actions/ActionManager";
import {ProcessManager} from "../processManager/ProcessManager";
import {PersistenceModel} from "../persistence/PersistenceModel";

/**
 *
 * @author Atzitz Amos
 * @date 11/14/2025
 * @since 1.0.0
 */
export class GlobalState {
    private static _isReady: boolean = false;
    private static shadowApp: ShadowApp;

    public static init(app: ShadowApp): void {
        this.shadowApp = app;
    }

    public static getShadowApp(): ShadowApp {
        return this.shadowApp;
    }

    public static getCurrentWorkspace(): Workspace {
        return GlobalProject.getInstance()!;
    }

    public static getMainEventBus(): EventBus {
        return EventBus.getMainEventBus();
    }

    public static getPluginManager(): PluginManager {
        return PluginManager.getInstance();
    }

    public static getLangSupport(): LangSupport {
        return LangSupport.getInstance();
    }

    public static getSettingsManager() {
        return SettingsManager.getInstance();
    }

    public static getProcessManager(): ProcessManager {
        return this.shadowApp.getProcessManager();
    }

    public static getActionManager(): ActionManager {
        return ActionManager.getInstance();
    }

    public static getPersistenceModel() {
        return PersistenceModel.getInstance();
    }

    public static setReady(flag: boolean) {
        this._isReady = flag;
    }

    public static isReady(): boolean {
        return this._isReady;
    }
}
