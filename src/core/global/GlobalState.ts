import {ShadowApp} from "../../app/ShadowApp";
import {Workspace} from "../workspace/Workspace";
import {GlobalProject} from "./GlobalProject";
import {EventBus} from "../events/EventBus";
import {PluginManager} from "../plugins/PluginManager";
import {LangSupport} from "../lang/LangSupport";
import {SettingsManager} from "../settings/SettingsManager";
import {ActionManager} from "../actions/ActionManager";
import {ProcessManager} from "../threaded/process/manager/ProcessManager";
import {PersistenceModel} from "../persistence/PersistenceModel";
import {Lifecycle} from "../lifecycle/Lifecycle";

/**
 * Provides a single class that regroups all useful singletons and global services of the application
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

    public static getLifecycle(): Lifecycle {
        return Lifecycle.getInstance();
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
        return Lifecycle.getProcessManager();
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
