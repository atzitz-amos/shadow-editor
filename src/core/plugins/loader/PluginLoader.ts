import {PluginManager} from "../PluginManager";
import {EditorPlugin} from "./Plugin";
import {ExtensionPointSupplier} from "../extensionPoints/ExtensionPointSupplier";
import {ExtensionPoint} from "../extensionPoints/ExtensionPoint";
import {Logger, UseLogger} from "../../logging/Logger";

export class LoadedExtensionPoint {
    owner: EditorPlugin;
    extPoints: ExtensionPoint<any>[];
    instance: ExtensionPointSupplier;

    constructor(extPoints: ExtensionPoint<any>[], owner: EditorPlugin, instance: ExtensionPointSupplier) {
        this.extPoints = extPoints;
        this.owner = owner;
        this.instance = instance;
    }

    registerSelf(manager: PluginManager): void {
        for (const extPoint of this.extPoints) extPoint.contribute(this.owner, this.instance);
    }

    unregisterSelf(manager: PluginManager): void {
        for (const extPoint of this.extPoints) extPoint.withdraw(this.owner);
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
        const stylesheets = this.resolveStylesheets();

        for (const module of modules) {
            const plugin = new module.pluginCls();
            const loadedExtensionPoints: Record<string, LoadedExtensionPoint[]> = {};
            for (const {extCls, extPoint, pluginName} of extensionPoints) {
                if (pluginName === module.pluginName) {
                    if (!loadedExtensionPoints[extPoint]) {
                        loadedExtensionPoints[extPoint] = [];
                    }
                    let extensionPoints = ExtensionPoint.forName(extPoint);
                    if (extensionPoints.length) {
                        loadedExtensionPoints[extPoint].push(new LoadedExtensionPoint(extensionPoints, plugin, new extCls()));
                    } else {
                        this.logger.debug("Skipping loading of extension point: " + extPoint + " for plugin: " + pluginName + " - extension point not found.");
                        delete loadedExtensionPoints[extPoint];
                    }
                }
            }

            const pluginStyles = stylesheets.filter(s => s.pluginName === module.pluginName).map(s => s.url);
            this.manager.registerPlugin(plugin, module.pluginName, loadedExtensionPoints, pluginStyles);
        }
    }

    /**
     * Async version of loadAll that supports async plugin onLoad/onEnable.
     */
    public async loadAllAsync(): Promise<void> {
        const modules = this.effectiveImport();
        const extensionPoints = this.resolveExtensionPoints();
        const stylesheets = this.resolveStylesheets();

        for (const module of modules) {
            const plugin = new module.pluginCls();
            const loadedExtensionPoints: Record<string, LoadedExtensionPoint[]> = {};

            for (const {extCls, extPoint, pluginName} of extensionPoints) {
                if (pluginName === module.pluginName) {
                    if (!loadedExtensionPoints[extPoint]) {
                        loadedExtensionPoints[extPoint] = [];
                    }
                    let extensionPoints = ExtensionPoint.forName(extPoint);
                    if (extensionPoints.length) {
                        loadedExtensionPoints[extPoint].push(new LoadedExtensionPoint(extensionPoints, plugin, new extCls()));
                    } else {
                        this.logger.debug("Skipping loading of extension point: " + extPoint + " for plugin: " + pluginName + " - extension point not found.");
                        delete loadedExtensionPoints[extPoint];
                    }
                }
            }

            const pluginStyles = stylesheets.filter(s => s.pluginName === module.pluginName).map(s => s.url);
            this.manager.registerPlugin(plugin, module.pluginName, loadedExtensionPoints, pluginStyles);

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

        // ** matches any depth, so a/b/ → extPoint "a.b", a/ → extPoint "a"
        const imports = import.meta.glob("/src/plugins/*/**/*.ts", {eager: true});
        const extensionPoints: {
            extCls: Constructor<ExtensionPointSupplier>,
            pluginName: string,
            extPoint: string
        }[] = [];

        for (const path in imports) {
            const module = imports[path] as { default: Constructor<ExtensionPointSupplier> };
            if (module && module.default) {
                // path = /src/plugins/{pluginName}/{seg…}/{file}.ts
                const split = path.split('/');
                const pluginName = split[3];
                // Every segment between pluginName (idx 3) and the filename (last)
                const extPointSegments = split.slice(4, split.length - 1);

                // Guard: skip plugin-root files (no subdir) and the styles directory
                if (extPointSegments.length === 0 || extPointSegments[0] === 'styles') {
                    continue;
                }

                // ['toolbar', 'items'] → "toolbar.items"
                const extPoint = extPointSegments.join('.');

                extensionPoints.push({ extCls: module.default, pluginName, extPoint });
                this.logger.debug(`Found extension point: ${extPoint} for plugin: ${pluginName}`);
            }
        }

        this.logger.debug("Finished scanning. Found " + extensionPoints.length + " extension points.");
        return extensionPoints;
    }

    /**
     * Auto-discovers CSS files from each plugin's styles/ directory.
     * Convention: /src/plugins/{pluginName}/styles/*.css
     */
    private resolveStylesheets(): { pluginName: string, url: string }[] {
        this.logger.debug("Scanning for plugin stylesheets...");

        const imports = import.meta.glob("/src/plugins/*/styles/*.css", {
            eager: false,
            query: "?url",
            import: "default"
        });
        const stylesheets: { pluginName: string, url: string }[] = [];

        for (const path in imports) {
            const split = path.split('/');
            // path = /src/plugins/{pluginName}/styles/{file}.css
            const pluginName = split[split.length - 3];

            stylesheets.push({pluginName, url: path});
            this.logger.debug("Found stylesheet: " + path + " for plugin: " + pluginName);
        }

        this.logger.debug("Finished scanning. Found " + stylesheets.length + " plugin stylesheets.");
        return stylesheets;
    }
}