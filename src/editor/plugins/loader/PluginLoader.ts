import {PluginManager} from "../PluginManager";
import {EditorPlugin} from "./Plugin";
import {IExtensionPointSupplier} from "../extensionPoints/IExtensionPointSupplier";
import {ExtensionPoint} from "../extensionPoints/ExtensionPoint";

export class PluginLoader {
    constructor(private manager: PluginManager) {

    }

    public loadAll(): void {
        const modules = this.effectiveImport();
        const extensionPoints = this.resolveExtensionPoints();

        for (const module of modules) {
            const instance = new module.pluginCls();
            const extPoints: Record<string, ExtensionPoint[]> = {};
            for (const cls of extensionPoints) {
                if (cls.pluginName === module.pluginName) {
                    if (!extPoints[cls.extPoint]) {
                        extPoints[cls.extPoint] = [];
                    }
                    extPoints[cls.extPoint].push({instance: new cls.extCls(), name: cls.extPoint});
                }
            }

            this.manager.registerPlugin({plugin: instance, extensionPoints: extPoints});
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
            }
        }

        return plugins;
    }

    private resolveExtensionPoints(): {
        extCls: Class<IExtensionPointSupplier>,
        pluginName: string,
        extPoint: string
    }[] {
        const imports = import.meta.glob("/src/editor/plugins/*/*.ts", {eager: true});
        const extensionPoints: {
            extCls: Class<IExtensionPointSupplier>,
            pluginName: string,
            extPoint: string
        }[] = [];
        for (const path in imports) {
            const module = imports[path] as { default: Class<IExtensionPointSupplier> };
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