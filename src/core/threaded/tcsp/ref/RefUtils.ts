import {ThreadedRefEngine} from "./ThreadedRefEngine";
import {UUIDHelper} from "../../../../editor/utils/UUIDHelper";

export type Constructor<T = any> = new (...args: any[]) => T;

export type PromisifiedFunction<T extends (...args: any[]) => any> =
    (...args: Parameters<T>) => ReturnType<T> extends Promise<any>
        ? ReturnType<T>
        : Promise<Ref<ReturnType<T>>>;

export type Ref<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any
        ? PromisifiedFunction<T[K]>
        : T[K];
} & { __ref_id: string };


export class RefCallbackRegistry {
    private static callbacks = new Map<string, Function>();

    static register(cb: Function): string {
        const id = UUIDHelper.newUUID();
        this.callbacks.set(id, cb);
        return id;
    }

    static unregister(id: string) {
        this.callbacks.delete(id);
    }

    static get(id: string): Function | undefined {
        return this.callbacks.get(id);
    }
}

if (typeof self !== 'undefined' && typeof window === 'undefined') {
    self.addEventListener("message", (event) => {
        if (event.data?.type === "free_cb") {
            RefCallbackRegistry.unregister(event.data.uuid);
        } else if (event.data?.type === "cb_invoke") {
            const cb = RefCallbackRegistry.get(event.data.uuid);
            if (cb) {
                const mappedArgs = (event.data.args ?? []).map((arg: any) => {
                    if (arg && typeof arg === "object" && arg.__is_ref) {
                        return RefUtils.wrapping(arg.uuid);
                    }
                    return arg;
                });
                cb(...mappedArgs);
            }
        }
    });
}

/**
 * A reference wrapper that enforces an asynchronous signature
 * for all methods belonging to the provided constructor's instance type.
 */
export class RefUtils {
    private static gcRegistry = new FinalizationRegistry<string>((uuid) => {
        ThreadedRefEngine.freeRef(uuid).catch(console.error);
    });

    public static ofCallChain<T extends Constructor>(callChain: string, type: T): Promise<Ref<InstanceType<T>>> {
        return new Promise(async (resolve, reject) => {
            const obj = await ThreadedRefEngine.invokeCallChain(callChain, []);
            resolve(RefUtils.wrapping(obj) as Ref<InstanceType<T>>);
        });
    }

    public static wrapping<T extends Constructor>(objId: string): Ref<InstanceType<T>> {
        const proxy = new Proxy({__ref_id: objId} as Ref<InstanceType<T>>, {
            get: (target, prop) => {
                if (typeof prop === "symbol") {
                    throw new Error("Cannot query symbol of reference");
                }
                if (prop === "then") return undefined;

                const callable: any = async (...args: any[]) => {
                    const serializedArgs = args.map(arg => {
                        if (typeof arg === "function") {
                            return { __is_cb: true, uuid: RefCallbackRegistry.register(arg) };
                        }
                        return arg;
                    });
                    console.log("Calling", objId, prop);
                    return RefUtils.wrapping(await ThreadedRefEngine.invokeMethod(
                        target.__ref_id,
                        prop,
                        serializedArgs
                    ))
                };

                callable.then = (resolve: any, reject: any) => {
                    ThreadedRefEngine.getProperty(target.__ref_id, prop).then(resolve, reject);
                };

                return callable;
            }
        });
        RefUtils.gcRegistry.register(proxy, objId);
        return proxy;
    }

    static async createRef(name: string) {
        return RefUtils.wrapping(await ThreadedRefEngine.createRef(name));
    }

    static async getDistantWindowRef(): Promise<Ref<Window>> {
        return await RefUtils.createRef("window") as Ref<Window>;
    }
}
