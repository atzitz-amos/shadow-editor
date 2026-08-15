// noinspection ES6UnusedImports

import {ShadowApp} from "../../app/ShadowApp";
import {Project} from "../project/Project";
import {ActiveProjectHelper} from "./ActiveProjectHelper";
import {EventBus} from "../events/EventBus";
import {PluginManager} from "../plugins/PluginManager";
import {LangSupport} from "../../lang/LangSupport";
import {SettingsManager} from "../settings/SettingsManager";
import {ActionManager} from "../actions/ActionManager";
import {ProcessManager} from "../threaded/process/manager/ProcessManager";
import {Lifecycle} from "../lifecycle/Lifecycle";
import {Editor} from "../../editor/Editor";
import {ShadowUI} from "../../app/ui/ShadowUI";

// Load DistantGlobalState service
import {DistantGlobalState} from "./DistantGlobalState";

import {WCPService} from "../threaded/wcp/WCPMetricsService";
import {PaneManager} from "../../app/core/panes/PaneManager";
import {TabsManager} from "../../app/core/tabs/TabsManager";
import {ProjectService} from "../project/ProjectService";
import {SaveService} from "../sync/save/SaveService";
import {EditorKeyContextManager} from "../../editor/core/keycontext/EditorKeyContextManager";
import {SynSuiteEngine} from "../../app/testLib/lang/suite/SynSuiteEngine";
import {CodeAnalysisService} from "../../lang/codeAnalysis/analysis/CodeAnalysisService";
import {WorkspaceManager} from "../project/workspace/WorkspaceManager";
import {WorkspaceRestorer} from "../project/WorkspaceRestorer";

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

    public static getCurrentProject(): Project {
        return ActiveProjectHelper.getInstance()!;
    }

    public static getWorkspaceManager(): WorkspaceManager {
        return WorkspaceManager.getInstance();
    }

    public static getWorkspaceRestorer(): WorkspaceRestorer {
        return WorkspaceRestorer.getInstance();
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

    public static getCodeAnalysisService(): CodeAnalysisService {
        return CodeAnalysisService.getInstance();
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

    public static getWCPMetricsService(): WCPService {
        return WCPService.getInstance();
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

    public static getProjectsService(): ProjectService {
        return ProjectService.getInstance();
    }

    public static getSaveService(): SaveService {
        return SaveService.getInstance();
    }

    public static getEditorKeyContextManager() {
        return EditorKeyContextManager.getInstance();
    }

    public static getSynSuiteEngine(): SynSuiteEngine {
        return SynSuiteEngine.getInstance();
    }

    public static setReady(flag: boolean) {
        this._isReady = flag;
    }

    public static isReady(): boolean {
        return this._isReady;
    }
}