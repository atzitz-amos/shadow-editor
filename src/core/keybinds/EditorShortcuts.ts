/**
 *
 * @author Atzitz Amos
 * @date 5/30/2026
 * @since 1.0.0
 */
import {PersistedClass} from "../threaded/service/Service";
import {Keybind} from "./Keybind";
import {Deserializer} from "../persistence/serializable/Deserializer";
import {Serializer} from "../persistence/serializable/Serializer";
import {Serialized} from "../persistence/serializable/Serializable";
import {PersistedObject} from "../persistence/objects/PersistedObject";

export type EditorShortcut = {
    keybind: Keybind;
    enabled: boolean;
}

@PersistedClass
export class EditorShortcuts implements PersistedObject {
    private static instance: EditorShortcuts;
    private shortcuts: Map<string, EditorShortcut> = new Map();

    public static getInstance(): EditorShortcuts {
        if (!EditorShortcuts.instance) {
            EditorShortcuts.instance = new EditorShortcuts();
        }
        return EditorShortcuts.instance;
    }

    persist(serializer: Serializer): Serialized {
        return serializer.serializeMap(this.shortcuts);
    }

    load(deserializer: Deserializer, data: Serialized): void {
        if (!data) return;
        this.shortcuts = deserializer.deserializeMap(data);
    }

    getPersistedKey(): string {
        return "shadow.editor.shortcuts";
    }
}
