import {Cell} from "./Cell";
import {PersistenceModel} from "../../PersistenceModel";
import {PersistedOptions} from "./PersistedOptions";

/**
 * @author Atzitz Amos
 * @date 8/13/2026
 * @since 1.0.0
 */
export class ArrayCell {

    /**
     * Creates a Proxy-wrapped real array that behaves exactly like `any[]`
     * (Array.isArray, spread, JSON.stringify, instanceof Array all work)
     * while also satisfying the Cell interface and persisting on mutation.
     */
    public static create(model: PersistenceModel, key: string, initial: any[], options?: PersistedOptions): any[] & Cell {
        let originalValue: any[] = initial;
        const target: any[] = [];

        const make = (v: any) => {
            if (options?.mutable && v !== null && typeof v === "object") {
                return new Proxy(v, {
                    set(t, prop, newValue) {
                        (t as any)[prop] = newValue;
                        model.persistCell(cellApi);
                        return true;
                    }
                });
            }
            return v;
        };

        const rebuild = () => {
            target.length = 0;
            target.push(...originalValue.map(make));
        };

        const cellApi: Cell = {
            init(value: any[]) {
                originalValue = value;
                rebuild();
            },
            getValue(): any {
                return originalValue;
            },
            getKey(): string {
                return key;
            },
            getOptions(): PersistedOptions | undefined {
                return options;
            },
            getVersion(): number {
                return options?.version ?? 1;
            },
        } as Cell;

        rebuild();

        const persist = () => model.persistCell(cellApi);

        // Methods that add/replace elements: mirror the raw args into
        // originalValue and the "made" (possibly wrapped) args into target.
        const addingMethods: Record<string, (...args: any[]) => any> = {
            push(...items: any[]) {
                originalValue.push(...items);
                const r = target.push(...items.map(make));
                persist();
                return r;
            },
            unshift(...items: any[]) {
                originalValue.unshift(...items);
                const r = target.unshift(...items.map(make));
                persist();
                return r;
            },
            splice(start: number, deleteCount?: number, ...items: any[]) {
                const r = deleteCount === undefined
                    ? originalValue.splice(start)
                    : originalValue.splice(start, deleteCount, ...items);
                const rt = deleteCount === undefined
                    ? target.splice(start)
                    : target.splice(start, deleteCount, ...items.map(make));
                persist();
                return rt.length ? rt : r;
            },
            fill(value: any, start?: number, end?: number) {
                originalValue.fill(value, start, end);
                target.fill(make(value), start, end);
                persist();
                return proxy;
            },
        };

        // Methods that only reorder/remove existing elements: safe to run
        // on both arrays independently, no re-wrapping needed.
        const reorderMethods = new Set(["pop", "shift", "reverse", "copyWithin"]);

        // sort needs special handling: sort originalValue with the given
        // comparator, then rebuild target so wrapping stays consistent.
        const sort = (compareFn?: (a: any, b: any) => number) => {
            originalValue.sort(compareFn);
            rebuild();
            persist();
            return proxy;
        };

        const handler: ProxyHandler<any[]> = {
            get(t, prop, receiver) {
                if (typeof prop === "string" && prop in cellApi) {
                    return (cellApi as any)[prop];
                }
                if (typeof prop === "string" && prop in addingMethods) {
                    return addingMethods[prop];
                }
                if (prop === "sort") {
                    return sort;
                }
                if (typeof prop === "string" && reorderMethods.has(prop)) {
                    return (...args: any[]) => {
                        (originalValue as any)[prop](...args);
                        const r = (target as any)[prop](...args);
                        persist();
                        return r;
                    };
                }
                return Reflect.get(t, prop, receiver);
            },
            set(t, prop, newValue) {
                if (typeof prop === "string" && /^\d+$/.test(prop)) {
                    originalValue[Number(prop)] = newValue;
                    t[Number(prop) as any] = make(newValue);
                    persist();
                    return true;
                }
                return Reflect.set(t, prop, newValue);
            },
            deleteProperty(t, prop) {
                if (typeof prop === "string" && /^\d+$/.test(prop)) {
                    delete originalValue[Number(prop)];
                    delete t[Number(prop) as any];
                    persist();
                    return true;
                }
                return Reflect.deleteProperty(t, prop);
            },
        };

        const proxy = new Proxy(target, handler) as any[] & Cell;
        return proxy;
    }
}