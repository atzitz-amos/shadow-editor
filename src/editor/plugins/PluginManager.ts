import {Editor} from "../Editor";
import {ActionManager} from "../core/actions/ActionManager";
import {EditorPlugin, LoadedPlugin} from "./loader/Plugin";
import {LoadedExtensionPoint, PluginLoader} from "./loader/PluginLoader";

export class PluginManager {
    private readonly actionManager: ActionManager;

    private readonly plugins: LoadedPlugin[] = [];

    private readonly waitingEnable: Class<EditorPlugin>[] = [];

    constructor(private editor: Editor) {
        this.actionManager = new ActionManager(editor);
    }

    getActionManager() {
        return this.actionManager;
    }

    getLanguageSupport() {
        return this.editor.getLangSupport();
    }

    loadAll() {
        new PluginLoader(this).loadAll();
    }

    registerPlugin(plugin: EditorPlugin, extensionPoints?: Record<string, LoadedExtensionPoint[]>): void {
        let loadedPlugin = new LoadedPlugin(plugin, extensionPoints || {});
        this.plugins.push(loadedPlugin);

        for (let i = 0; i < this.waitingEnable.length; i++) {
            if (plugin instanceof this.waitingEnable[i]) {
                loadedPlugin.enable(this.editor);
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
        loadedPlugin.enable(this.editor);
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
        loadedPlugin.disable(this.editor);
    }
}
