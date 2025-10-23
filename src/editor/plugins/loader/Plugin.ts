import {LoadedExtensionPoint} from "./PluginLoader";
import {Editor} from "../../Editor";

export abstract class EditorPlugin {

    public static get class(): Class<EditorPlugin> {
        // @ts-ignore
        return this;
    }

    public onEnable(editor: Editor): void {

    }

    public onDisable(editor: Editor): void {

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

    enable(editor: Editor) {
        this.isEnabled = true;
        this.plugin.onEnable(editor);
    }

    disable(editor: Editor) {
        this.isEnabled = false;
        this.plugin.onDisable(editor);
    }
}