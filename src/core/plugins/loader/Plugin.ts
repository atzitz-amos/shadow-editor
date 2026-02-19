import {LoadedExtensionPoint} from "./PluginLoader";
import {StyleManager} from "../../styles/StyleManager";

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

    /**
     * Optional: Return an array of CSS stylesheet URLs to load when this plugin is enabled.
     * The stylesheets are automatically removed when the plugin is disabled.
     *
     * @example
     * ```typescript
     * getStylesheets(): string[] {
     *     return ["src/plugins/myPlugin/styles/myPlugin.css"];
     * }
     * ```
     */
    public getStylesheets?(): string[];
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
        this.loadPluginStylesheets();
        this.plugin.onEnable();
    }

    disable() {
        this.isEnabled = false;
        this.unloadPluginStylesheets();
        this.plugin.onDisable();
    }

    getPluginName() {
        return this.name;
    }

    private loadPluginStylesheets(): void {
        if (typeof this.plugin.getStylesheets !== "function") return;

        const urls = this.plugin.getStylesheets();
        if (!urls || urls.length === 0) return;

        const styleManager = StyleManager.getInstance();
        for (let i = 0; i < urls.length; i++) {
            const id = `plugin-auto-${this.name}-${i}`;
            styleManager.registerStylesheet(id, urls[i]);
        }
    }

    private unloadPluginStylesheets(): void {
        if (typeof this.plugin.getStylesheets !== "function") return;

        const urls = this.plugin.getStylesheets();
        if (!urls || urls.length === 0) return;

        const styleManager = StyleManager.getInstance();
        for (let i = 0; i < urls.length; i++) {
            const id = `plugin-auto-${this.name}-${i}`;
            styleManager.unregisterStylesheet(id);
        }
    }
}