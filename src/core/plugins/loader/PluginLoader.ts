import {PluginManager} from "../PluginManager";
import {EditorPlugin} from "./Plugin";
import {ExtensionPointSupplier} from "../extensionPoints/ExtensionPointSupplier";
import {ExtensionPoint} from "../extensionPoints/ExtensionPoint";
import {getExtensionPoint} from "../extensionPoints/Extension";
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

type PluginModule = { pluginCls: Constructor<EditorPlugin>, pluginName: string };
type ExtensionModule = {
    extCls: Constructor<ExtensionPointSupplier>,
    pluginName: string,
    extPoint: string
};
type StylesheetEntry = { pluginName: string, url: () => Promise<string> };

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
            this.loadModule(module, extensionPoints, stylesheets);
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
            const plugin = this.loadModule(module, extensionPoints, stylesheets);

            // Await plugin's async onLoad if it exists
            if (typeof plugin.onLoadAsync === 'function') {
                await plugin.onLoadAsync();
            }
        }
    }

    private loadModule(
        module: PluginModule,
        extensionModules: ExtensionModule[],
        stylesheets: StylesheetEntry[]
    ): EditorPlugin {
        const plugin = new module.pluginCls();
        const loadedExtensionPoints: Record<string, LoadedExtensionPoint[]> = {};

        for (const {extCls, extPoint, pluginName} of extensionModules) {
            if (pluginName !== module.pluginName) continue;

            const targets = ExtensionPoint.forName(extPoint);
            if (!targets.length) {
                this.logger.debug("Skipping loading of extension point: " + extPoint + " for plugin: " + pluginName + " - extension point not found.");
                continue;
            }

            (loadedExtensionPoints[extPoint] ??= []).push(new LoadedExtensionPoint(targets, plugin, new extCls()));
        }

        const pluginStyles = stylesheets.filter(s => s.pluginName === module.pluginName).map(s => s.url);
        this.manager.registerPlugin(plugin, module.pluginName, loadedExtensionPoints, pluginStyles);

        return plugin;
    }

    private effectiveImport(): PluginModule[] {
        this.logger.debug("Scanning for plugins...");

        const imports = import.meta.glob("/src/plugins/*/*.ts", {eager: true});
        const plugins: PluginModule[] = [];

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

    /**
     * Discovers extension point suppliers anywhere under /src/plugins/{pluginName}/.
     * A supplier is any default-exported class in a subdirectory of the plugin. The plugin
     * name always comes from the path. The extension point comes from @Extension("some.point")
     * if present, otherwise from the directory: a/b/File.ts → "a.b".
     */
    private resolveExtensionPoints(): ExtensionModule[] {
        this.logger.debug("Scanning for extension points...");

        const imports = import.meta.glob("/src/plugins/*/**/*.ts", {eager: true});
        const extensionPoints: ExtensionModule[] = [];

        for (const path in imports) {
            const module = imports[path] as { default?: Constructor<ExtensionPointSupplier> };
            if (!module || !module.default) continue;

            // path = /src/plugins/{pluginName}/{seg…}/{file}.ts
            const split = path.split('/');
            const pluginName = split[3];

            // 1. Explicit @Extension decorator wins and allows any directory layout.
            // 2. Otherwise fall back to the directory convention:
            //    ['toolbar', 'items'] → "toolbar.items"
            let extPoint = getExtensionPoint(module.default);
            let source = "decorator";

            if (!extPoint) {
                const extPointSegments = split.slice(4, split.length - 1);

                // Guard: skip plugin-root files (no subdir) and the styles directory
                if (extPointSegments.length === 0 || extPointSegments[0] === 'styles') {
                    continue;
                }

                extPoint = extPointSegments.join('.');
                source = "path";
            }

            extensionPoints.push({extCls: module.default, pluginName, extPoint});
            this.logger.debug(`Found extension point: ${extPoint} for plugin: ${pluginName} (${module.default.name}, via ${source})`);
        }

        this.logger.debug("Finished scanning. Found " + extensionPoints.length + " extension points.");
        return extensionPoints;
    }

    /**
     * Auto-discovers CSS files from each plugin's styles/ directory.
     * Convention: /src/plugins/{pluginName}/styles/*.css
     */
    private resolveStylesheets(): StylesheetEntry[] {
        this.logger.debug("Scanning for plugin stylesheets...");

        const imports = import.meta.glob("/src/plugins/*/styles/*.css", {
            eager: false,
            query: "?url",
            import: "default"
        });
        const stylesheets: StylesheetEntry[] = [];

        for (const path in imports) {
            const split = path.split('/');
            // path = /src/plugins/{pluginName}/styles/{file}.css
            const pluginName = split[split.length - 3];

            const stylesheetUrlLoader = imports[path] as () => Promise<string>;
            stylesheets.push({pluginName, url: stylesheetUrlLoader});
            this.logger.debug("Found stylesheet: " + path + " for plugin: " + pluginName);
        }

        this.logger.debug("Finished scanning. Found " + stylesheets.length + " plugin stylesheets.");
        return stylesheets;
    }
}