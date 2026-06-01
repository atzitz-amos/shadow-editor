import {Serializer} from "../serializable/Serializer";
import {Serialized} from "../serializable/Serializable";
import {Deserializer} from "../serializable/Deserializer";

/**
 *
 * @author Atzitz Amos
 * @date 5/30/2026
 * @since 1.0.0
 */
export interface PersistedObject {
    getPersistedKey(): string;

    persist(serializer: Serializer): Serialized;

    load(deserializer: Deserializer, data: Serialized): void;
}
