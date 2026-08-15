import {Deserializer} from "./Deserializer";

export interface Serializable {
    serialize(): SerializableType;
}

export type SerializableType =
    | number
    | string
    | boolean
    | null
    | Serializable
    | SerializableType[]
    | Set<SerializableType>
    | { [key: string]: SerializableType }
    | Map<string, SerializableType>;


export type DeserializerFunc = (deserializer: Deserializer) => void;


export type JSONSerializedObject =
    | string
    | number
    | boolean
    | null
    | JSONSerializedObject[]
    | { [key: string]: JSONSerializedObject };

export type Serialized = { value: JSONSerializedObject | Serialized } & {
    __type: string,
    __class?: string
};
