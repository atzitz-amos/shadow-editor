enum MutatationType {
    INITIALIZE = 1,
    VALUE_CHANGE = 2,
    LIST_ELEMENT_ADDED = 4,
    LIST_ELEMENT_REMOVED = 8,
    LIST_MUTATED = LIST_ELEMENT_ADDED | LIST_ELEMENT_REMOVED,
    MAP_KEY_ADDED = 16,
    MAP_KEY_REMOVED = 32,
    MAP_KEY_CHANGED = 64,
    MAP_MUTATED = MAP_KEY_ADDED | MAP_KEY_REMOVED | MAP_KEY_CHANGED,
    MUTATED = VALUE_CHANGE | LIST_MUTATED | MAP_MUTATED
}


function propagateChange<This extends object>(mutationType: MutatationType, inst: This, newValue: any, oldValue: any) {

}

export function UIWatched<This extends object, T>(mutator: any) {
    return function (value: undefined, context: ClassFieldDecoratorContext<This, T>) {
        context.addInitializer(function (this: This) {
            const name = context.name;
            // At this point the field already has its initial value
            let stored = this[name] as T;

            Object.defineProperty(this, name, {
                get: () => stored,
                set: (newValue: T) => {
                    const oldValue = stored;
                    stored = newValue;
                    if (newValue !== oldValue) {
                        propagateChange(MutatationType.VALUE_CHANGE, this, newValue, oldValue);
                    }
                },
                enumerable: true,
                configurable: true,
            });
        });
    };
}