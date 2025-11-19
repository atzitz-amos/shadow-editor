import {ActionManager} from "../actions/ActionManager";
import {EditorPlugin, LoadedPlugin} from "./loader/Plugin";
import {LoadedExtensionPoint, PluginLoader} from "./loader/PluginLoader";
import {LangSupport} from "../lang/LangSupport";

export class PluginManager {
    private static instance: PluginManager;

    private readonly plugins: LoadedPlugin[] = [];
    private readonly waitingEnable: Class<EditorPlugin>[] = [];

    public static loadAll(): void {
        if (this.instance) {
            throw new Error("PluginManager has already been initialized!");
        }
        this.instance = new PluginManager();
    }

    public static getInstance(): PluginManager {
        if (!this.instance) {
            this.instance = new PluginManager();
        }
        return this.instance;
    }

    getActionManager() {
        return ActionManager.getInstance();
    }

    getLanguageSupport() {
        return LangSupport.getInstance();
    }

    loadAll() {
        new PluginLoader(this).loadAll();
    }

    registerPlugin(plugin: EditorPlugin, extensionPoints?: Record<string, LoadedExtensionPoint[]>): void {
        let loadedPlugin = new LoadedPlugin(plugin, extensionPoints || {});
        this.plugins.push(loadedPlugin);

        for (let i = 0; i < this.waitingEnable.length; i++) {
            if (plugin instanceof this.waitingEnable[i]) {
                loadedPlugin.enable(); // TODO: EnableContext
                this.waitingEnable.splice(i, 1);
                break;
            }
        }
    }

    registerExtensionPoint(extensionPoint: LoadedExtensionPoint): void {
        extensionPoint.registerSelf(this);
    }

    getPluginList() {
        return this.plugins;
    }

    enable(plugin: Class<EditorPlugin>) {
        for (const p of this.plugins) {
            if (p.getPlugin() instanceof plugin) {
                if (!p.enabled()) {
                    this.doEnable(p);
                }
                return;
            }
        }
        this.waitingEnable.push(plugin);
    }

    disable(plugin: Class<EditorPlugin>) {
        for (const p of this.plugins) {
            if (p.getPlugin() instanceof plugin) {
                if (p.enabled()) {
                    this.doDisable(p);
                }
                return;
            }
        }
    }

    private doEnable(loadedPlugin: LoadedPlugin) {
        loadedPlugin.enable();  // TODO: EnableContext
        for (const extPoints of Object.values(loadedPlugin.getExtensionPoints())) {
            for (const extPoint of extPoints) {
                extPoint.registerSelf(this);
            }
        }
    }

    private doDisable(loadedPlugin: LoadedPlugin) {
        for (const extPoints of Object.values(loadedPlugin.getExtensionPoints())) {
            for (const extPoint of extPoints) {
                extPoint.unregisterSelf(this);
            }
        }
        loadedPlugin.disable();  // TODO: EnableContext
    }
}
