import {PluginManager} from "../PluginManager";
import {EditorPlugin} from "../loader/Plugin";
import {LangExtensionPoint} from "./LangExtensionPoint";
import {ActionsExtensionPoint} from "./ActionsExtensionPoint";
import {StartupPhaseExtensionPoint} from "./StartupPhaseExtensionPoint";

export interface ExtensionPoint {
    getName(): string;

    register(manager: PluginManager, owner: EditorPlugin, instance: any): void;

    unregister(manager: PluginManager, owner: EditorPlugin): void;
}

export class ExtensionPointsLoader {
    public static readonly EXTENSION_POINTS = {
        "lang": LangExtensionPoint.class,
        "actions": ActionsExtensionPoint.class,
        "startupPhase": StartupPhaseExtensionPoint.class
    };

    public static forName(name: string) {
        if (this.EXTENSION_POINTS[name]) {
            return this.EXTENSION_POINTS[name];
        }
        return null;
    }
}