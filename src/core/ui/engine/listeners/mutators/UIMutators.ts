import {MutatationType, UIMutator, UIMutatorsHooks} from "./UIMutator";
import {UIListenersManager} from "../UIListenersManager";
import {UIHooks} from "../hooks/UIHooks";

function propagateChange<This extends object>(mutator: UIMutator<Class<This>>, mutationType: MutatationType, inst: This, newValue: any, oldValue: any) {
    UIListenersManager.getInstance().trigger(UIMutatorsHooks.MUTATE, mutator, mutationType, inst, newValue, oldValue);
}

// Mutating Array methods and which mutation type they produce
const ARRAY_MUTATIONS: Record<string, MutatationType> = {
    push: MutatationType.LIST_ELEMENT_ADDED,
    unshift: MutatationType.LIST_ELEMENT_ADDED,
    pop: MutatationType.LIST_ELEMENT_REMOVED,
    shift: MutatationType.LIST_ELEMENT_REMOVED,
    splice: MutatationType.LIST_MUTATED,
    sort: MutatationType.LIST_MUTATED,
    reverse: MutatationType.LIST_MUTATED,
    fill: MutatationType.LIST_MUTATED,
    copyWithin: MutatationType.LIST_MUTATED,
};

function wrapArray<This extends object, T>(arr: T[], mutator: UIMutator<Class<This>>, inst: This): T[] {
    return new Proxy(arr, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            const mutationType = ARRAY_MUTATIONS[prop as string];

            if (mutationType !== undefined && typeof value === "function") {
                return function (...args: any[]) {
                    const oldValue = [...target];
                    const result = (value as Function).apply(target, args);
                    propagateChange(mutator, mutationType, inst, target, oldValue);
                    return result;
                };
            }
            return value;
        },
        set(target, prop, value, receiver) {
            // Direct index assignment: arr[i] = x
            const oldValue = [...target];
            const result = Reflect.set(target, prop, value, receiver);
            if (typeof prop === "string" && !isNaN(Number(prop))) {
                propagateChange(mutator, MutatationType.LIST_MUTATED, inst, target, oldValue);
            }
            return result;
        }
    });
}

function wrapMap<This extends object, K, V>(map: Map<K, V>, mutator: UIMutator<Class<This>>, inst: This): Map<K, V> {
    return new Proxy(map, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);

            if (typeof value !== "function") return value;

            switch (prop) {
                case "set":
                    return function (key: K, newVal: V) {
                        const oldVal = target.get(key);
                        const mutationType = target.has(key)
                            ? MutatationType.MAP_KEY_CHANGED
                            : MutatationType.MAP_KEY_ADDED;
                        const result = target.set(key, newVal);
                        propagateChange(mutator, mutationType, inst, newVal, oldVal);
                        return result;
                    };

                case "delete":
                    return function (key: K) {
                        const oldVal = target.get(key);
                        const result = target.delete(key);
                        if (result) {
                            propagateChange(mutator, MutatationType.MAP_KEY_REMOVED, inst, undefined, oldVal);
                        }
                        return result;
                    };

                case "clear":
                    return function () {
                        const oldValue = new Map(target);
                        target.clear();
                        propagateChange(mutator, MutatationType.MAP_MUTATED, inst, undefined, oldValue);
                    };

                default:
                    return value.bind(target);
            }
        }
    });
}

function wrapValue<This extends object, T>(value: T, mutator: UIMutator<Class<This>>, inst: This): T {
    if (Array.isArray(value)) return wrapArray(value, mutator, inst) as T;
    if (value instanceof Map) return wrapMap(value, mutator, inst) as T;
    return value;
}

export class UIMutators {
    public static mutates<This extends object, T>(mutator: UIMutator<Class<This>>) {
        return function (value: undefined, context: ClassFieldDecoratorContext<This, T>) {
            context.addInitializer(function (this: This) {
                const name = context.name;
                let stored = wrapValue(this[name as keyof This] as T, mutator, this);

                propagateChange(mutator, MutatationType.WAS_INITIALIZED, this, stored, undefined);

                Object.defineProperty(this, name, {
                    get: () => stored,
                    set: (newValue: T) => {
                        const oldValue = stored;
                        stored = wrapValue(newValue, mutator, this);
                        propagateChange(mutator, MutatationType.VALUE_CHANGED, this, stored, oldValue);
                    },
                    enumerable: true,
                    configurable: true,
                });
            });
        };
    }

    public static on<This extends object, MutatedObject extends object>(mutator: UIMutator<Class<MutatedObject>>, type: MutatationType) {
        return (
            original: (this: This, ...args: [MutatationType, MutatedObject, any, any]) => unknown,
            context: ClassMethodDecoratorContext<This, (this: This, ...args: [MutatationType, MutatedObject, any, any]) => unknown>
        ): void => {
            if (context.private) {
                throw new Error("@UIHooks.react cannot be used on private methods.");
            }

            context.addInitializer(function (this: This) {
                UIHooks.on(UIMutatorsHooks.MUTATE, this, (m: UIMutator<MutatedObject>, mutationType: MutatationType, mutatedObject: MutatedObject, newValue: any, oldValue: any) => {
                    if (m == mutator && (mutationType & type) !== 0) {
                        original.call(this, mutationType, mutatedObject, newValue, oldValue);
                    }
                });
            });
        }
    }

    public static addListener<MutatedObject extends object>(mutator: UIMutator<Class<MutatedObject>>, type: MutatationType, owner: any, listener: (mutationType: MutatationType, mutatedObject: MutatedObject, newValue: any, oldValue: any) => unknown) {
        UIListenersManager.getInstance().register(UIMutatorsHooks.MUTATE, owner, (m: UIMutator<MutatedObject>, mutationType: MutatationType, mutatedObject: MutatedObject, newValue: any, oldValue: any) => {
            if (m == mutator && (mutationType & type) !== 0) {
                listener.call(null, mutationType, mutatedObject, newValue, oldValue);
            }
        });
    }
}