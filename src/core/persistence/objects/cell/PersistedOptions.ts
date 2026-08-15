import {DeserializerFunc} from "../../serializable/Serializable";
import {Migration} from "../../migration/Migration";

export interface PersistedOptions {
    deserializer?: DeserializerFunc;
    mutable?: boolean;
    version?: number;                     // current shape version, default 1
    migrations?: Record<number, Migration>; // fromVersion -> transform to (fromVersion+1)
}