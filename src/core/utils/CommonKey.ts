/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class CommonKeyImpl<T> {
    public static readonly COMMON_KEYS_STORE = Symbol("commonKeysStore");

    constructor(public readonly key: string) {
    }

    toString() {
        return "CommonKeys." + this.key;
    }
}

export function hasCommonKey(ctor: any, key: CommonKeyImpl<any>): ctor is {
    [CommonKeyImpl.COMMON_KEYS_STORE]?: Record<string, string>
} {
    const commonKeys = ctor[CommonKeyImpl.COMMON_KEYS_STORE];
    return commonKeys !== undefined && key.key in commonKeys;
}

export function getCommonKeyValue<T>(ctor: {
    [CommonKeyImpl.COMMON_KEYS_STORE]?: Record<string, string>
}, key: CommonKeyImpl<T>): T | null {
    const commonKeys = ctor[CommonKeyImpl.COMMON_KEYS_STORE];
    if (commonKeys !== undefined && key.key in commonKeys) {
        return ctor[commonKeys[key.key]];
    }
    return null;
}

function registerCommonKey(instance: any, commonKey: string, propertyName: string): void {
    const commonKeys = instance[CommonKeyImpl.COMMON_KEYS_STORE] ??= {};
    commonKeys[commonKey] = propertyName;
}

export function CommonKey<T>(
    key: CommonKeyImpl<T>
): (value: undefined, context: ClassFieldDecoratorContext<any, T>) => void {
    return (_value, context) => {
        if (context.static) {
            throw new Error("Can only use common keys with instance members.");
        }
        if (context.private || typeof context.name === "symbol") {
            throw new Error("Cannot use common keys with symbol-named properties.");
        }

        const propertyName = context.name;
        context.addInitializer(function () {
            registerCommonKey(
                this,
                key.key,
                propertyName
            );
        });
    };
}