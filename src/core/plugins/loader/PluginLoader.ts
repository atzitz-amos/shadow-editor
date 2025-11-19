import {PluginManager} from "../PluginManager";
import {EditorPlugin} from "./Plugin";
import {ExtensionPointSupplier} from "../extensionPoints/ExtensionPointSupplier";
import {ExtensionPoint, ExtensionPointsLoader} from "../extensionPoints/ExtensionPoint";

export class LoadedExtensionPoint {
    owner: EditorPlugin;
    extPoint: ExtensionPoint;
    instance: ExtensionPointSupplier;

    constructor(extPoint: ExtensionPoint, owner: EditorPlugin, instance: ExtensionPointSupplier) {
        this.extPoint = extPoint;
        this.owner = owner;
        this.instance = instance;
    }

    registerSelf(manager: PluginManager): void {
        this.extPoint.register(manager, this.owner, this.instance);
    }

    unregisterSelf(manager: PluginManager): void {
        this.extPoint.unregister(manager, this.owner);
    }
}

export class PluginLoader {
    constructor(private manager: PluginManager) {

    }

    public loadAll(): void {
        const modules = this.effectiveImport();
        const extensionPoints = this.resolveExtensionPoints();

        for (const module of modules) {
            const plugin = new module.pluginCls();
            const loadedExtensionPoints: Record<string, LoadedExtensionPoint[]> = {};
            for (const {extCls, extPoint, pluginName} of extensionPoints) {
                if (pluginName === module.pluginName) {
                    if (!loadedExtensionPoints[extPoint]) {
                        loadedExtensionPoints[extPoint] = [];
                    }
                    let extensionPoint = ExtensionPointsLoader.forName(extPoint);
                    if (extensionPoint) {
                        loadedExtensionPoints[extPoint].push(new LoadedExtensionPoint(extensionPoint, plugin, new extCls()));
                    }
                }
            }

            this.manager.registerPlugin(plugin, loadedExtensionPoints);
        }
    }

    private effectiveImport(): { pluginCls: Class<EditorPlugin>, pluginName: string }[] {
        const imports = import.meta.glob("/src/plugins/*/*.ts", {eager: true});
        const plugins: { pluginCls: Class<EditorPlugin>, pluginName: string }[] = [];

        for (const path in imports) {
            const module = imports[path] as { default: Class<EditorPlugin> };
            if (module && module.default) {
                let split = path.split('/');
                plugins.push({pluginCls: module.default, pluginName: split[split.length - 2]});
            } else if (module) {
                console.warn("[PluginLoader.ts] Warning: Couldn't load plugin from path: " + path + ". Did you forget to export default your plugin class?");
            }
        }

        return plugins;
    }

    private resolveExtensionPoints(): {
        extCls: Class<ExtensionPointSupplier>,
        pluginName: string,
        extPoint: string
    }[] {
        const imports = import.meta.glob("/src/plugins/*/*/*.ts", {eager: true});
        const extensionPoints: {
            extCls: Class<ExtensionPointSupplier>,
            pluginName: string,
            extPoint: string
        }[] = [];
        for (const path in imports) {
            const module = imports[path] as { default: Class<ExtensionPointSupplier> };
            if (module && module.default) {
                const split = path.split('/');
                extensionPoints.push({
                    extCls: module.default,
                    pluginName: split[split.length - 3],
                    extPoint: split[split.length - 2]
                });
            }
        }
        return extensionPoints;
    }
}