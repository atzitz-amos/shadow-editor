import {PluginManager} from "../PluginManager";
import {EditorPlugin} from "./Plugin";
import {ExtensionPointSupplier} from "../extensionPoints/ExtensionPointSupplier";
import {ExtensionPoint, ExtensionPointsLoader} from "../extensionPoints/ExtensionPoint";
import {Logger, UseLogger} from "../../logging/Logger";

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

@UseLogger("PluginLoader")
export class PluginLoader {
    private declare readonly logger: Logger;

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
                    } else {
                        this.logger.debug("Skipping loading of extension point: " + extPoint + " for plugin: " + pluginName + " - extension point not found.");
                        delete loadedExtensionPoints[extPoint];
                    }
                }
            }

            this.manager.registerPlugin(plugin, module.pluginName, loadedExtensionPoints);
        }
    }

    /**
     * Async version of loadAll that supports async plugin onLoad/onEnable.
     */
    public async loadAllAsync(): Promise<void> {
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
                    } else {
                        this.logger.debug("Skipping loading of extension point: " + extPoint + " for plugin: " + pluginName + " - extension point not found.");
                        delete loadedExtensionPoints[extPoint];
                    }
                }
            }

            this.manager.registerPlugin(plugin, module.pluginName, loadedExtensionPoints);

            // Await plugin's async onLoad if it exists
            if (typeof plugin.onLoadAsync === 'function') {
                await plugin.onLoadAsync();
            }
        }
    }

    private effectiveImport(): { pluginCls: Constructor<EditorPlugin>, pluginName: string }[] {
        this.logger.debug("Scanning for plugins...");

        const imports = import.meta.glob("/src/plugins/*/*.ts", {eager: true});
        const plugins: { pluginCls: Constructor<EditorPlugin>, pluginName: string }[] = [];

        let invalid: number = 0;

        for (const path in imports) {
            const module = imports[path] as { default: Constructor<EditorPlugin> };
            const split = path.split('/');

            this.logger.debug("Scheduling plugin for load: " + split[split.length - 2]);
            if (module && module.default) {
                plugins.push({pluginCls: module.default, pluginName: split[split.length - 2]});
            } else if (module) {
                this.logger.warn("Couldn't load plugin from path: " + path + ". Did you forget to export default your plugin class?");
                invalid++;
            }
        }

        this.logger.debug("Finished scanning. Found " + (plugins.length + invalid) + " plugins (" + invalid + " invalid).");

        return plugins;
    }

    private resolveExtensionPoints(): {
        extCls: Constructor<ExtensionPointSupplier>,
        pluginName: string,
        extPoint: string
    }[] {

        this.logger.debug("Scanning for extension points...");

        const imports = import.meta.glob("/src/plugins/*/*/*.ts", {eager: true});
        const extensionPoints: {
            extCls: Constructor<ExtensionPointSupplier>,
            pluginName: string,
            extPoint: string
        }[] = [];
        for (const path in imports) {
            const module = imports[path] as { default: Constructor<ExtensionPointSupplier> };
            if (module && module.default) {
                const split = path.split('/');
                extensionPoints.push({
                    extCls: module.default,
                    pluginName: split[split.length - 3],
                    extPoint: split[split.length - 2]
                });

                this.logger.debug("Found extension point: " + split[split.length - 2] + " for plugin: " + split[split.length - 3]);
            }
        }

        this.logger.debug("Finished scanning. Found " + extensionPoints.length + " extension points.");
        return extensionPoints;
    }
}