import {EditorPlugin, LoadedPlugin} from "./loader/Plugin";
import {LoadedExtensionPoint, PluginLoader} from "./loader/PluginLoader";
import {Service} from "../lifecycle/Service";
import {Logger, UseLogger} from "../logging/Logger";

@Service
@UseLogger("PluginManager")
export class PluginManager {
    private static instance: PluginManager;
    private declare readonly logger: Logger;

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


    /**
     * Synchronous begin for backward compatibility.
     * Called by the @Service decorator mechanism.
     * The actual plugin loading happens in beginAsync() during PluginLoadPhase.
     */
    begin() {
        // Plugin loading is now handled by PluginLoadPhase via beginAsync()
        // This is kept for @Service compatibility but does nothing
    }

    /**
     * Async plugin loading, called during the PluginLoadPhase.
     */
    async beginAsync(): Promise<void> {
        this.logger.info("Loading plugins...");
        const loader = new PluginLoader(this);
        await loader.loadAllAsync();
    }

    registerPlugin(plugin: EditorPlugin, name: string, extensionPoints?: Record<string, LoadedExtensionPoint[]>): void {
        let loadedPlugin = new LoadedPlugin(plugin, name, extensionPoints || {});
        this.plugins.push(loadedPlugin);

        this.logger.info("Successfully registered plugin: " + name);
        for (let i = 0; i < this.waitingEnable.length; i++) {
            if (plugin instanceof this.waitingEnable[i]) {
                loadedPlugin.enable(); // TODO: EnableContext
                this.waitingEnable.splice(i, 1);

                this.logger.info("Enabled plugin '" + name + "' from waiting list.");
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

        this.logger.info("Enabled plugin: " + loadedPlugin.getPluginName());
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
