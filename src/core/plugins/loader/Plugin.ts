import {LoadedExtensionPoint} from "./PluginLoader";

export abstract class EditorPlugin {

    public static get class(): Class<EditorPlugin> {
        // @ts-ignore
        return this;
    }

    public onEnable(): void {
        // TODO: Enable context

    }

    public onDisable(): void {

    }
}


export class LoadedPlugin {
    private readonly plugin: EditorPlugin;
    private readonly extensionPoints: Record<string, LoadedExtensionPoint[]>;
    private isEnabled: boolean = false;

    constructor(plugin: EditorPlugin, extensionPoints: Record<string, LoadedExtensionPoint[]>) {
        this.plugin = plugin;
        this.extensionPoints = extensionPoints;

        this.isEnabled = false;
    }

    getPlugin() {
        return this.plugin;
    }

    getExtensionPoints() {
        return this.extensionPoints;
    }

    enabled() {
        return this.isEnabled;
    }

    enable() {
        this.isEnabled = true;
        this.plugin.onEnable();
    }

    disable() {
        this.isEnabled = false;
        this.plugin.onDisable();
    }
}