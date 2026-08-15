import {Cell} from "./Cell";
import {PersistenceModel} from "../../PersistenceModel";
import {PersistedOptions} from "./PersistedOptions";

/**
 * @author Atzitz Amos
 * @date 8/13/2026
 * @since 1.0.0
 */
export class MapCell implements Cell, Map<any, any> {
    private value: Map<any, any> = new Map<any, any>();
    private originalValue: Map<any, any> = new Map<any, any>();
    private readonly model: PersistenceModel;
    private readonly key: string;
    private readonly options?: PersistedOptions;

    public constructor(model: PersistenceModel, key: string, initial: Map<any, any>, options?: PersistedOptions) {
        this.model = model;
        this.key = key;
        this.options = options;
        this.value = initial;
    }

    get size() {
        return this.value.size;
    }

    get [Symbol.toStringTag]() {
        return this.value[Symbol.toStringTag];
    }

    get(key: any): any {
        return this.value.get(key);
    }

    set(key: any, value: any): this {
        this.originalValue.set(key, value);
        this.value.set(key, this.make(value));
        this.model.persistCell(this);
        return this;
    }

    delete(key: any): boolean {
        const wasDeleted = this.value.delete(key);
        if (wasDeleted) this.model.persistCell(this);
        return wasDeleted;
    }

    entries(): MapIterator<[any, any]> {
        return this.value.entries();
    }

    values(): MapIterator<any> {
        return this.value.values();
    }

    keys(): MapIterator<any> {
        return this.value.keys();
    }

    [Symbol.iterator]() {
        return this.value[Symbol.iterator]();
    }

    clear() {
        this.value.clear();
        this.model.persistCell(this);
    }

    forEach(callbackfn: (value: any, key: any, map: Map<any, any>) => void, thisArg?: any) {
        this.value.forEach(callbackfn, thisArg);
    }

    has(key: any): boolean {
        return this.value.has(key);
    }

    init(value: Map<any, any>): void {
        this.originalValue = value;
        this.value = new Map();
        for (const [key, val] of value.entries()) {
            this.value.set(key, this.make(val));
        }
    }

    getValue(): any {
        return this.originalValue;
    }

    getKey(): string {
        return this.key;
    }

    getOptions(): PersistedOptions | undefined {
        return this.options;
    }

    getVersion(): number {
        return this.options?.version ?? 1;
    }

    private make(value: any) {
        if (this.options && this.options.mutable) {
            // intercept modifications on the object and trigger persistence
            return new Proxy(value, {
                set: (target, prop, newValue) => {
                    target[prop] = newValue;
                    this.model.persistCell(this);
                    return true;
                }
            });
        }

        return value;
    }
}