import {ExtensionPoint} from "../extensionPoints/ExtensionPoint";

export abstract class EditorPlugin {

}

/**
 * Internal use only.
 * */
export interface LoadedPlugin {
    plugin: EditorPlugin;
    extensionPoints: Record<string, ExtensionPoint[]>;
}