import {DataKey} from "./DataKey";
import {DataProvider} from "./DataProvider";
import {KeybindNotApplicableAbortError} from "../KeybindNotApplicableAbortError";

const LAZY_VALUE = Symbol("lazyDataValue");

interface LazyDataValue<T> {
    readonly [LAZY_VALUE]: true;
    get(): T;
}

export type DataResolver = (key: DataKey<unknown>) => unknown | (() => unknown) | undefined;

/**
 * An immutable, layered collection of contextual values.
 *
 * A child context shadows values in its parent without modifying the parent.
 * Lazy values are evaluated at most once, when they are first read.
 */
export class DataContext {
    public static readonly EMPTY = new DataContext();

    private readonly values: ReadonlyMap<DataKey<unknown>, unknown>;
    private readonly parent: DataContext | null;
    private readonly resolver?: DataResolver;
    private readonly resolved = new Map<DataKey<unknown>, unknown>();
    private readonly unresolved = new Set<DataKey<unknown>>();

    public constructor(parent: DataContext | null = null, values?: ReadonlyMap<DataKey<unknown>, unknown>, resolver?: DataResolver) {
        this.parent = parent;
        this.values = values ?? new Map();
        this.resolver = resolver;
    }

    public get<T>(key: DataKey<T>): T | undefined {
        if (this.values.has(key)) {
            const value = this.values.get(key) as T | LazyDataValue<T>;
            if (typeof value === "object" && value !== null && (value as LazyDataValue<T>)[LAZY_VALUE] === true)
                return (value as LazyDataValue<T>).get();
            return value as T;
        }
        if (this.parent?.has(key)) return this.parent.get(key);
        const value = this.resolve(key);
        if (typeof value === "function") return this.cacheLazy(key, value as () => T);
        return value as T | undefined;
    }

    public has<T>(key: DataKey<T>): boolean {
        return this.values.has(key) || (this.parent?.has(key) ?? false) || this.resolve(key) !== undefined;
    }

    public require<T>(key: DataKey<T>): T {
        const value = this.get(key);
        if (value === undefined && !this.has(key))
            throw new KeybindNotApplicableAbortError(`No value associated with data key "${key.name}".`);
        return value as T;
    }

    public with<T>(key: DataKey<T>, value: T): DataContext {
        const values = new Map<DataKey<unknown>, unknown>();
        values.set(key, value);
        return new DataContext(this, values, this.resolver);
    }

    public withLazy<T>(key: DataKey<T>, provider: DataProvider<T> | (() => T)): DataContext {
        let evaluated = false;
        let value: T;
        const lazyProvider: LazyDataValue<T> = {
            [LAZY_VALUE]: true,
            get: () => {
                if (!evaluated) {
                    value = typeof provider === "function" ? provider() : provider.get();
                    evaluated = true;
                }
                return value;
            }
        };
        return new DataContext(this, new Map([[key, lazyProvider]]), this.resolver);
    }

    private resolve(key: DataKey<unknown>): unknown | (() => unknown) | undefined {
        if (this.resolved.has(key)) return this.resolved.get(key);
        if (this.unresolved.has(key)) return undefined;
        const value = this.resolver?.(key);
        if (value === undefined) this.unresolved.add(key);
        else this.resolved.set(key, value);
        return value;
    }

    private cacheLazy<T>(key: DataKey<unknown>, provider: () => T): T {
        let evaluated = false;
        let value: T;
        const lazyValue: LazyDataValue<T> = {
            [LAZY_VALUE]: true,
            get: () => {
                if (!evaluated) {
                    value = provider();
                    evaluated = true;
                }
                return value;
            }
        };
        this.resolved.set(key, lazyValue);
        return lazyValue.get();
    }
}
