import {Serializable, SerializableType, Serialized} from "./Serializable";
import {SerializationUtils} from "./SerializationUtils";

/**
 *
 * @author Atzitz Amos
 * @date 5/30/2026
 * @since 1.0.0
 */
export class Serializer {

    serializeMap<E extends SerializableType>(map: Map<string, E>): Serialized {
        const serialized = {};
        for (const [key, value] of map.entries()) {
            serialized[key] = this.serializeObject(value);
        }

        return as("map", serialized);
    }

    serializeSet<E extends SerializableType>(set: Set<E>): Serialized {
        return as("set", Array.from(set).map(item => this.serializeObject(item)));
    }

    serializeArray<E extends SerializableType>(obj: E[]): Serialized {
        return as("list", obj.map(item => this.serializeObject(item)));
    }

    serializeObject<E extends SerializableType>(obj: E): Serialized {
        if (obj === null || obj === undefined || typeof obj === "number" || typeof obj === "string" || typeof obj === "boolean") {
            return as("primitive", obj);
        }

        if (Array.isArray(obj)) {
            return this.serializeArray(obj);
        }

        if (obj instanceof Map) {
            return this.serializeMap(obj);
        }

        if (obj instanceof Set) {
            return this.serializeSet(obj);
        }

        if (typeof obj === "object") {
            if ("serialize" in obj && typeof obj.serialize === "function") {
                return as("serialized", (obj as Serializable).serialize(), obj);
            }
            return this.serializePlainObject(obj as Record<string, any>);
        }

        throw new Error(`Unsupported type for serialization: ${typeof obj}`);
    }

    serializePlainObject<E extends SerializableType>(obj: Record<string, E>): Serialized {
        return as("object",
            Object.fromEntries(Object.entries(obj)
                .map(([key, value]) => [key, this.serializeObject(value)])),
            obj);
    }
}

function as<E extends SerializableType>(type: string, value: any): Serialized;
function as<E extends SerializableType>(type: string, value: any, cls: any): Serialized;
function as<E extends SerializableType>(type: string, value: any, cls?: any): Serialized {
    return cls ? {
        __type: type,
        __class: SerializationUtils.getSerializableClassName(cls),
        value: value
    } : {
        __type: type,
        value: value
    }
}
