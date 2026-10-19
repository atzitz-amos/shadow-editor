import type {GlobalState} from "./GlobalState"; // type-only: must not pull GlobalState into the worker bundle
import type {Lifecycle} from "../lifecycle/Lifecycle";
import type {Project} from "../project/Project";
import type {PluginManager} from "../plugins/PluginManager";
import type {LangRegistry} from "../../lang/LangRegistry";
import type {SettingsManager} from "../settings/SettingsManager";
import type {ProcessManager} from "../threaded/process/manager/ProcessManager";
import type {ActionManager} from "../actions/ActionManager";
import type {Editor} from "../../editor/Editor";
import {Ref, RefUtils} from "../threaded/tcsp/ref/RefUtils";
import {EventBus} from "../events/EventBus";
import {PaneManager} from "../../app/core/panes/PaneManager";
import {TabsManager} from "../../app/core/tabs/TabsManager";
import {SyncService} from "../sync/sync/SyncService";

/**
 * Worker-side facade over the main thread's GlobalState.
 *
 * @author Atzitz Amos
 * @date 4/3/2026
 * @since 1.0.0
 */
export class DistantGlobalState {
    private static rootRef: Promise<Ref<typeof GlobalState>> | null = null;

    public static getSyncService(): SyncService {
        return SyncService.getInstance();
    }

    public static async getLifecycle(): Promise<Ref<Lifecycle>> {
        return (await DistantGlobalState.root()).getLifecycle();
    }

    /** Resolves to undefined/null (by value) when no project is open. */
    public static async getCurrentProject(): Promise<Ref<Project> | null | undefined> {
        return (await DistantGlobalState.root()).getCurrentProject();
    }

    public static async getMainEventBus(): Promise<Ref<EventBus>> {
        return (await DistantGlobalState.root()).getMainEventBus();
    }

    public static async getPluginManager(): Promise<Ref<PluginManager>> {
        return (await DistantGlobalState.root()).getPluginManager();
    }

    public static async getLangSupport(): Promise<Ref<LangRegistry>> {
        return (await DistantGlobalState.root()).getLangRegistry();
    }

    public static async getSettingsManager(): Promise<Ref<SettingsManager>> {
        return (await DistantGlobalState.root()).getSettingsManager();
    }

    public static async getProcessManager(): Promise<Ref<ProcessManager>> {
        return (await DistantGlobalState.root()).getProcessManager();
    }

    public static async getActionManager(): Promise<Ref<ActionManager>> {
        return (await DistantGlobalState.root()).getActionManager();
    }

    public static async getPaneManager(): Promise<Ref<PaneManager>> {
        return (await DistantGlobalState.root()).getPaneManager();
    }

    public static async getTabsManager(): Promise<Ref<TabsManager>> {
        return (await DistantGlobalState.root()).getTabsManager();
    }

    public static async getMainEditor(): Promise<Ref<Editor>> {
        return (await DistantGlobalState.root()).getMainEditor();
    }

    public static init() {

    }

    /** One shared ref to the (pinned, never freed) GlobalState root. */
    private static root(): Promise<Ref<typeof GlobalState>> {
        return (DistantGlobalState.rootRef ??= RefUtils.createRef<typeof GlobalState>("GlobalState"));
    }
}