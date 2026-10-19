/**
 * Shared wire format for the threaded reference system.
 *
 * Rule: primitives travel BY VALUE, everything else travels BY REFERENCE.
 */
export type Primitive = string | number | boolean | bigint | null | undefined | void;

export type RefMarker = { __is_ref: true; uuid: string };
export type CallbackMarker = { __is_cb: true; uuid: string };

/** What a call result / property read looks like on the wire. */
export type Wire = Primitive | RefMarker;

export function isPrimitive(value: unknown): value is Primitive {
    return value === null
        || (typeof value !== "object" && typeof value !== "function" && typeof value !== "symbol");
}

export function isRefMarker(value: any): value is RefMarker {
    return !!value && typeof value === "object" && value.__is_ref === true && typeof value.uuid === "string";
}

export function isCallbackMarker(value: any): value is CallbackMarker {
    return !!value && typeof value === "object" && value.__is_cb === true && typeof value.uuid === "string";
}