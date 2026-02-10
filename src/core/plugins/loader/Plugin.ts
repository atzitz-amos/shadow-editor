import {LoadedExtensionPoint} from "./PluginLoader";

export abstract class EditorPlugin {

    public static get class(): Class<EditorPlugin> {
        // @ts-ignore
        return this;
    }

    /**
     * Called when the plugin is enabled.
     */
    public onEnable(): void {
        // TODO: Enable context
    }

    /**
     * Called when the plugin is disabled.
     */
    public onDisable(): void {
    }

    /**
     * Optional async initialization called during plugin loading phase.
     * Override this if your plugin needs async setup (e.g., loading resources).
     */
    public onLoadAsync?(): Promise<void>;
}


export class LoadedPlugin {
    private readonly plugin: EditorPlugin;
    private readonly extensionPoints: Record<string, LoadedExtensionPoint[]>;
    private readonly name: string;
    private isEnabled: boolean = false;

    constructor(plugin: EditorPlugin, name: string, extensionPoints: Record<string, LoadedExtensionPoint[]>) {
        this.name = name;
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

    getPluginName() {
        return this.name;
    }
}