import {Lifecycle} from "../lifecycle/Lifecycle";
import {Workspace} from "../workspace/Workspace";
import {PluginManager} from "../plugins/PluginManager";
import {LangSupport} from "../lang/LangSupport";
import {SettingsManager} from "../settings/SettingsManager";
import {ProcessManager} from "../threaded/process/manager/ProcessManager";
import {ActionManager} from "../actions/ActionManager";
import {PersistenceModel} from "../persistence/PersistenceModel";
import {Editor} from "../../editor/Editor";
import {Ref, RefUtils} from "../threaded/tcsp/ref/RefUtils";
import {EventBus} from "../events/EventBus";
import {PaneManager} from "../../app/ui/panes/PaneManager";
import {TabsManager} from "../../app/ui/tabs/TabsManager";

/**
 *
 * @author Atzitz Amos
 * @date 4/3/2026
 * @since 1.0.0
 */
export class DistantGlobalState {
    public static getLifecycle(): Promise<Ref<Lifecycle>> {
        return RefUtils.ofCallChain("GlobalState.getLifecycle", Lifecycle);
    }

    public static getCurrentWorkspace(): Promise<Ref<Workspace>> {
        return RefUtils.ofCallChain("GlobalState.getCurrentWorkspace", Workspace);
    }

    public static getMainEventBus(): Promise<Ref<EventBus>> {
        return RefUtils.ofCallChain("GlobalState.getMainEventBus", EventBus);
    }

    public static getPluginManager(): Promise<Ref<PluginManager>> {
        return RefUtils.ofCallChain("GlobalState.getPluginManager", PluginManager);
    }

    public static getLangSupport(): Promise<Ref<LangSupport>> {
        return RefUtils.ofCallChain("GlobalState.getLangSupport", LangSupport);
    }

    public static getSettingsManager(): Promise<Ref<SettingsManager>> {
        return RefUtils.ofCallChain("GlobalState.getSettingsManager", SettingsManager);
    }

    public static getProcessManager(): Promise<Ref<ProcessManager>> {
        return RefUtils.ofCallChain("GlobalState.getProcessManager", ProcessManager);
    }

    public static getActionManager(): Promise<Ref<ActionManager>> {
        return RefUtils.ofCallChain("GlobalState.getActionManager", ActionManager);
    }

    public static getPersistenceModel(): Promise<Ref<PersistenceModel>> {
        return RefUtils.ofCallChain("GlobalState.getPersistenceModel", PersistenceModel);
    }

    public static getPaneManager(): Promise<Ref<PaneManager>> {
        return RefUtils.ofCallChain("GlobalState.getPaneManager", PaneManager);
    }

    public static getTabsManager(): Promise<Ref<TabsManager>> {
        return RefUtils.ofCallChain("GlobalState.getTabsManager", TabsManager);
    }

    public static getMainEditor(): Promise<Ref<Editor>> {
        return RefUtils.ofCallChain("GlobalState.getMainEditor", Editor);
    }

    /**
     * getMainEditor() : Ref<Editor>("GlobalState.getMainEditor()")
     * .getOpenedDocument() : Ref<Document>("
     *
     * */
}
