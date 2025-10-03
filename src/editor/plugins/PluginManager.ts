import {EditorPlugin, LoadedPlugin} from "./loader/Plugin";

export class PluginManager {
    registerPlugin(plugin: EditorPlugin, extensionPoints: Record<string, any[]>): void ;
    registerPlugin(plugin: LoadedPlugin): void;
    registerPlugin(plugin: EditorPlugin | LoadedPlugin, extensionPoints?: Record<string, any[]>): void {
        if (plugin instanceof EditorPlugin) {
            plugin = {plugin, extensionPoints: extensionPoints || {}};
        }
    }
}