import {LoadedExtensionPoint} from "./PluginLoader";
import {StyleManager} from "../../styles/StyleManager";

export abstract class EditorPlugin {

    public static get class(): Class<EditorPlugin> {
        // @ts-ignore
        return this;
    }

    public abstract getId(): string;

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
    private readonly stylesheets: Array<() => Promise<string>>;
    private readonly name: string;
    private isEnabled: boolean = false;

    constructor(plugin: EditorPlugin, name: string, extensionPoints: Record<string, LoadedExtensionPoint[]>, stylesheets: Array<() => Promise<string>> = []) {
        this.name = name;
        this.plugin = plugin;
        this.extensionPoints = extensionPoints;
        this.stylesheets = stylesheets;

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
        void this.loadStylesheets();
        this.plugin.onEnable();
    }

    disable() {
        this.isEnabled = false;
        this.unloadStylesheets();
        this.plugin.onDisable();
    }

    getPluginName() {
        return this.name;
    }

    private loadStylesheets(): Promise<void> {
        if (this.stylesheets.length === 0) return Promise.resolve();

        const styleManager = StyleManager.getInstance();
        const loads: Promise<void>[] = [];
        for (let i = 0; i < this.stylesheets.length; i++) {
            const id = `plugin-${this.name}-css-${i}`;
            const urlPromise = this.stylesheets[i]();
            loads.push(urlPromise.then(url => styleManager.registerStylesheet(id, url)));
        }
        return Promise.all(loads).then(() => undefined);
    }

    private unloadStylesheets(): void {
        if (this.stylesheets.length === 0) return;

        const styleManager = StyleManager.getInstance();
        for (let i = 0; i < this.stylesheets.length; i++) {
            const id = `plugin-${this.name}-css-${i}`;
            styleManager.unregisterStylesheet(id);
        }
    }
}
