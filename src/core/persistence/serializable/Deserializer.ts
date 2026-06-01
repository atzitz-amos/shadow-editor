import {SerializableType, Serialized} from "./Serializable";
import {UseLogger} from "../../logging/logger/LoggerDecorators";
import {Logger} from "../../logging/logger/LoggerCore";
import {SerializationUtils} from "./SerializationUtils";

/**
 *
 * @author Atzitz Amos
 * @date 5/30/2026
 * @since 1.0.0
 */
@UseLogger("Deserializer")
export class Deserializer {
    private readonly declare logger: Logger;

    private readonly customDeserializers: Map<string, CustomDeserializer<any>> = new Map();

    use(name: Class<any>, deserializer: CustomDeserializer<any>): void;
    use(name: string, deserializer: CustomDeserializer<any>): void;
    use(name: string | Class<any>, deserializer: CustomDeserializer<any>): void {
        if (typeof name !== "string") {
            name = SerializationUtils.getClassName(name);
        }
        this.customDeserializers.set(name, deserializer);
    }

    deserializeObject<T extends SerializableType>(data: Serialized): T {
        switch (data.__type) {
            case "primitive":
                return data.value as T;
            case "list":
                return this.deserializeList(data) as T;
            case "map":
                return this.deserializeMap(data) as T;
            case "serialized":
                if (data.__class && this.customDeserializers.has(data.__class)) {
                    const deserializer = this.customDeserializers.get(data.__class)!;
                    return deserializer(data.value as any);
                }
                this.logger.warn(`No deserialization logic provided for serialized type (${data.__class}), returning raw value. ` +
                    "This may lead to issues if the value is not directly usable.");
                return this.deserializePlain(data.value as any) as T;
            case "object":
                return this.deserializePlain(data.value as any) as T;
            default:
                throw new Error(`Unsupported type for deserialization: ${data.__type}`);
        }
    }

    deserializeList<T extends SerializableType>(data: Serialized): T[] {
        return (data.value as Serialized[]).map(item => this.deserializeObject(item));
    }

    deserializeMap<K extends SerializableType, V extends SerializableType>(data: Serialized): Map<K, V>;
    deserializeMap<K extends SerializableType, V extends SerializableType>(data: Serialized): Map<K, V> {
        const map = new Map<K, V>();
        for (const [key, value] of Object.entries(data.value as object)) {
            if (value != null && typeof value === "object" && "__type" in value) {
                const deserializedValue = this.deserializeObject<V>(value as Serialized);
                map.set(key as K, deserializedValue);
            } else {
                map.set(key as K, value as V);
            }
        }
        return map;
    }

    deserializePlain<E extends SerializableType>(value: Serialized): Record<string, E> {
        const obj: Record<string, E> = {};
        for (const [key, val] of Object.entries(value)) {
            if (val != null && typeof val === "object" && "__type" in val) {
                obj[key] = this.deserializeObject<E>(val as Serialized);
            } else {
                obj[key] = val as E;
            }
        }
        return obj;
    }
}

export type CustomDeserializer<V> = (data: any) => V;
