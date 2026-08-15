import {PersistenceModel} from "../PersistenceModel";
import {PersistedOptions} from "./cell/PersistedOptions";
import {Cell} from "./cell/Cell";

function createObjectKey(cls: Constructor | Function, name: string) {
    return cls.name + "." + name;
}

interface PersistedAccessor {
    get(): any;

    set(v: any): void;

    getCell(): Cell;
}

function createMapAccessor(cls: Constructor | Function, name: string, initialValue: Map<any, any>, options: PersistedOptions | undefined): PersistedAccessor {
    function makeProxy(target: Map<any, any>) {
        return PersistenceModel.getInstance().createMapCell(createObjectKey(cls, name), target, options);
    }

    let proxy = makeProxy(initialValue);

    return {
        get(): any {
            return proxy;
        },
        set(value: any) {
            if (!(value instanceof Map)) throw new Error("Invalid assignment to field " + name + ", expected type 'Map'.");
            proxy = makeProxy(value);
        },
        getCell(): Cell {
            return proxy;
        },
    };
}

function createArrayAccessor(cls: Constructor | Function, name: string, initialValue: any[], options: PersistedOptions | undefined): PersistedAccessor {
    function makeProxy(target: Array<any>) {
        return PersistenceModel.getInstance().createArrayCell(createObjectKey(cls, name), target, options);
    }

    let proxy = makeProxy(initialValue);

    return {
        get(): any {
            return proxy;
        },
        set(value: any) {
            if (!(value instanceof Array)) throw new Error("Invalid assignment to field " + name + ", expected type 'Array'.");
            proxy = makeProxy(value);
        },
        getCell(): Cell {
            return proxy;
        },
    };
}

function createPersistedAccessor(cls: Constructor | Function, name: string, initialValue: any, options: PersistedOptions | undefined): PersistedAccessor {
    if (initialValue instanceof Map) {
        return createMapAccessor(cls, name, initialValue, options);
    } else if (Array.isArray(initialValue)) {
        return createArrayAccessor(cls, name, initialValue, options);
    }

    const model = PersistenceModel.getInstance();
    const cell = model.createCell(createObjectKey(cls, name), initialValue, options);

    return {
        get(): any {
            return cell.getValue();
        },
        set(v: any) {
            cell.setValue(v);
        },
        getCell(): Cell {
            return cell;
        },
    };
}

const PERSISTED_KEYS = Symbol("persistedKeys");
const PERSISTED_TRIGGERS = Symbol("persistedTriggers");
const IS_PERSIST_TRIGGER = Symbol("isPersistTrigger");

function ensureRegistry(ctor: Function): Set<string> {
    if (!(ctor as any)[PERSISTED_KEYS]) {
        Object.defineProperty(ctor, PERSISTED_KEYS, {
            value: new Set<string>(),
            enumerable: false,
            configurable: false,
        });
    }
    return (ctor as any)[PERSISTED_KEYS];
}

function ensureTriggers(ctor: Function): Map<string, () => void> {
    if (!Object.prototype.hasOwnProperty.call(ctor, PERSISTED_TRIGGERS)) {
        Object.defineProperty(ctor, PERSISTED_TRIGGERS, {
            value: new Map<string, () => void>(),
            enumerable: false,
            configurable: false,
        });
    }
    return (ctor as any)[PERSISTED_TRIGGERS];
}

function ensureTriggerPersistMethod(ctor: Function) {
    const existing = (ctor as any).triggerPersist;
    if (Object.prototype.hasOwnProperty.call(ctor, "triggerPersist") && existing && existing[IS_PERSIST_TRIGGER]) {
        return;
    }

    const triggerPersist = async function (this: any): Promise<void> {
        // Only fires triggers registered directly on this class, not inherited ones,
        // matching the own-registry semantics used elsewhere in this file.
        const model = PersistenceModel.getInstance();
        const triggers = ensureTriggers(ctor);
        for (const trigger of triggers.values()) {
            trigger();
        }
        await model.flushNow();
    };
    (triggerPersist as any)[IS_PERSIST_TRIGGER] = true;

    Object.defineProperty(ctor, "triggerPersist", {
        value: triggerPersist,
        enumerable: false,
        configurable: true,
        writable: true,
    });
}

function doPersist(cls: Constructor | Function, name: string, initialValue: any, options?: PersistedOptions) {
    // Clean up static field defined by class initializer before attaching property descriptor
    delete (cls as any)[name];

    const accessor = createPersistedAccessor(cls, name, initialValue, options);

    Object.defineProperty(cls, name, {
        get: accessor.get,
        set: accessor.set,
        enumerable: true,
        configurable: true,
    });

    const model = PersistenceModel.getInstance();
    ensureTriggers(cls).set(name, () => model.persistCell(accessor.getCell()));
}

function classDecorator(options: PersistedOptions | undefined) {
    return function (_ctor: Function, context: ClassDecoratorContext) {
        context.addInitializer(function (this: any) {
            const target = this as Function;
            const registry = ensureRegistry(target);
            const names = Object.getOwnPropertyNames(target).filter((n) => {
                if (n === "length" || n === "name" || n === "prototype") return false;
                if (registry.has(n)) return false;
                const desc = Object.getOwnPropertyDescriptor(target, n)!;
                return typeof desc.value !== "function"; // skip static methods
            });
            for (const name of names) {
                registry.add(name);
                doPersist(target, name, (target as any)[name], options);
            }
            ensureTriggerPersistMethod(target);
        });
    };
}

function accessorDecorator(options: PersistedOptions | undefined) {
    return function (
        _target: ClassAccessorDecoratorTarget<any, any>,
        context: ClassAccessorDecoratorContext
    ) {
        if (!context.static) {
            throw new Error(`@Persisted accessor '${String(context.name)}' must be static.`);
        }

        let accessor: PersistedAccessor;

        context.addInitializer(function (this: any) {
            const registry = ensureRegistry(this);
            registry.add(String(context.name));
            const model = PersistenceModel.getInstance();
            ensureTriggers(this).set(String(context.name), () => model.persistCell(accessor.getCell()));
            ensureTriggerPersistMethod(this);
        });

        return {
            get(): any {
                return accessor.get();
            },
            set(v: any) {
                accessor.set(v);
            },
            init(this: any, initialValue: any) {
                accessor = createPersistedAccessor(this, String(context.name), initialValue, options);
                return initialValue;
            },
        };
    };
}

export function Persisted(options: PersistedOptions): any;
export function Persisted(
    value: undefined | ClassAccessorDecoratorTarget<any, any>,
    context: ClassAccessorDecoratorContext
): any;
export function Persisted<T extends new (...args: any[]) => any>(
    value: T,
    context: ClassDecoratorContext
): void;
export function Persisted(...args: any[]): any {
    const isDirectUsage = args.length === 2 && args[1] && typeof args[1] === "object" && "kind" in args[1];

    if (isDirectUsage) {
        const [value, context] = args as [any, ClassAccessorDecoratorContext | ClassDecoratorContext];
        if (context.kind === "accessor") return accessorDecorator(undefined)(value, context);
        if (context.kind === "class") return classDecorator(undefined)(value, context);
        throw new Error(`@Persisted can only be applied to a class or a static accessor.`);
    }

    const options = args[0] as PersistedOptions | undefined;
    return function (value: any, context: ClassAccessorDecoratorContext | ClassDecoratorContext) {
        if (context.kind === "accessor") return accessorDecorator(options)(value, context);
        if (context.kind === "class") return classDecorator(options)(value, context);
        throw new Error(`@Persisted can only be applied to a class or a static accessor.`);
    };
}