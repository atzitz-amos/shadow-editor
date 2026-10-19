import {ThreadedRefEngine} from "./ThreadedRefEngine";
import {UUIDHelper} from "../../../../editor/utils/UUIDHelper";
import {isRefMarker, Primitive, Wire} from "./RefProtocol";

export type Constructor<T = any> = new (...args: any[]) => T;

/** Primitives are delivered as-is, everything else as a Ref. */
export type Remote<T> = T extends Primitive ? T : Ref<T>;

export type RemoteMethod<F extends (...args: any[]) => any> =
    (...args: Parameters<F>) => Promise<Remote<Awaited<ReturnType<F>>>>;

/** Extra members for anything iterable on the remote side (arrays, NodeList, Set, ...). */
export type RefIterable<E> = {
    /** Fetches (a slice of) the elements in ONE round trip: primitives by value, objects as Refs. */
    $items(start?: number, end?: number): Promise<Remote<E>[]>;
    /** `for await (const x of ref)`: snapshot of the elements, fetched in one round trip. */
    [Symbol.asyncIterator](): AsyncIterator<Remote<E>>;
};

export type Ref<T> = {
    // `as K` stops TS from treating Ref<Foo[]> as "an array of mapped elements",
    // which would drop `length`, `forEach`, etc.
    [K in keyof T as K]: T[K] extends (...args: any[]) => any
        ? RemoteMethod<T[K]>
        : PromiseLike<Remote<T[K]>>; // `await ref.prop`
} & {
    readonly __ref_id: string;
    isDefined(): Promise<boolean>;
    /** Structured-clones the referenced object (works for plain data, and for refs that point at a primitive). */
    $value(): Promise<T>;
} & (T extends Iterable<infer E> ? RefIterable<E> : unknown);

export class RefCallbackRegistry {
    private static readonly callbacks = new Map<string, Function>();

    static register(cb: Function): string {
        const id = UUIDHelper.newUUID();
        this.callbacks.set(id, cb);
        return id;
    }

    static unregister(id: string): void {
        this.callbacks.delete(id);
    }

    static get(id: string): Function | undefined {
        return this.callbacks.get(id);
    }
}

// Worker side: receives callback invocations / frees from the main thread.
if (typeof self !== "undefined" && typeof window === "undefined") {
    self.addEventListener("message", (event) => {
        const data = event.data;
        if (data?.type === "free_cb") {
            RefCallbackRegistry.unregister(data.uuid);
        } else if (data?.type === "cb_invoke") {
            const cb = RefCallbackRegistry.get(data.uuid);
            cb?.(...(data.args ?? []).map((arg: any) => RefUtils.decodeCallbackArg(arg)));
        }
    });
}

export class RefUtils {
    private static readonly gcRegistry = new FinalizationRegistry<string>(uuid => {
        ThreadedRefEngine.freeRef(uuid).catch(console.error);
    });

    /** proxy -> ref id, so refs can be recognised and passed back as arguments. */
    private static readonly proxies = new WeakMap<object, string>();

    public static isRef(value: unknown): value is Ref<any> {
        return typeof value === "object" && value !== null && RefUtils.proxies.has(value);
    }

    public static wrapping<T = any>(uuid: string): Ref<T> {
        const proxy = new Proxy({}, {
            get: (_target, prop) => {
                if (prop === Symbol.asyncIterator) {
                    return async function* () {
                        for (const item of await ThreadedRefEngine.getItems(uuid)) yield RefUtils.decode(item);
                    };
                }
                if (typeof prop === "symbol") return undefined; // keeps console.log, Symbol.toPrimitive etc. safe

                switch (prop) {
                    case "then":
                        return undefined; // a Ref must never look like a thenable itself
                    case "__ref_id":
                        return uuid;
                    case "isDefined":
                        return () => ThreadedRefEngine.isDefined(uuid);
                    case "$items":
                        return async (start?: number, end?: number) =>
                            (await ThreadedRefEngine.getItems(uuid, start, end)).map(w => RefUtils.decode(w));
                    case "$value":
                        return () => ThreadedRefEngine.getValue(uuid);
                    default:
                        return RefUtils.member(uuid, prop);
                }
            }
        }) as Ref<T>;

        RefUtils.proxies.set(proxy, uuid);
        RefUtils.gcRegistry.register(proxy, uuid);
        return proxy;
    }

    public static async createRef<T>(name: string): Promise<Ref<T>> {
        return RefUtils.wrapping<T>(await ThreadedRefEngine.createRef(name));
    }

    public static getDistantWindowRef(): Promise<Ref<Window>> {
        return RefUtils.createRef<Window>("window");
    }

    static decodeCallbackArg(arg: any): any {
        return Array.isArray(arg) ? arg.map(item => RefUtils.decodeCallbackArg(item)) : RefUtils.decode(arg);
    }

    /** Turns a wire value into a primitive or a Ref. */
    private static decode(wire: Wire): any {
        return isRefMarker(wire) ? RefUtils.wrapping(wire.uuid) : wire;
    }

    /**
     * `ref.name` is both:
     *  - callable:  `await ref.name(...args)`  -> invokes the remote method
     *  - thenable:  `await ref.name`           -> reads the remote property
     */
    private static member(uuid: string, name: string): any {
        const call: any = async (...args: any[]) =>
            RefUtils.decode(await ThreadedRefEngine.invokeMethod(uuid, name, args.map(a => RefUtils.serializeArg(a))));

        call.then = (resolve: any, reject: any) =>
            ThreadedRefEngine.getProperty(uuid, name).then(w => RefUtils.decode(w)).then(resolve, reject);

        return call;
    }

    private static serializeArg(arg: any): any {
        if (Array.isArray(arg)) return arg.map(item => RefUtils.serializeArg(item));
        if (typeof arg === "function") return {__is_cb: true, uuid: RefCallbackRegistry.register(arg)};
        if (RefUtils.isRef(arg)) return {__is_ref: true, uuid: arg.__ref_id};
        return arg;
    }
}