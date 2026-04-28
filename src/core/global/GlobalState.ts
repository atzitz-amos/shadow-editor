// noinspection ES6UnusedImports

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
import {Editor} from "../../editor/Editor";
import {ShadowUI} from "../../app/ui/ShadowUI";

// Load DistantGlobalState service
import {DistantGlobalState} from "./DistantGlobalState";
// Load WCPService tracker
import {WCPService} from "../threaded/wcp/WCPMetricsService";
import {PaneManager} from "../../app/ui/panes/PaneManager";
import {TabsManager} from "../../app/ui/tabs/TabsManager";
import {UIWatched} from "../ui/engine/hooks/UIHooksHelper";

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

    @UIWatched(null)
    private static d: number = 0;

    public static init(app: ShadowApp): void {
        this.shadowApp = app;
    }

    public static getShadowApp(): ShadowApp {
        return this.shadowApp;
    }

    public static getUI(): ShadowUI {
        let ui = this.shadowApp.getUI();
        if (ui === undefined) {
            throw new Error("UI is not initialized yet");
        }
        return ui;
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

    public static getWCPService(): WCPService {
        return WCPService.getInstance();
    }

    public static getPersistenceModel() {
        return PersistenceModel.getInstance();
    }

    public static getPaneManager(): PaneManager {
        return PaneManager.getInstance();
    }

    public static getTabsManager(): TabsManager {
        return TabsManager.getInstance();
    }

    public static getMainEditor(): Editor {
        return GlobalState.getUI().getMainEditor();
    }

    public static setReady(flag: boolean) {
        this._isReady = flag;
    }

    public static isReady(): boolean {
        return this._isReady;
    }
}
