import {UIHook} from "../hooks/UIHook";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class UIMutator<This extends Object> {
    public readonly owner: object;
    public readonly key: string;
    public readonly id: string;

    private readonly type: "mutator" = "mutator";

    constructor(owner: any, key: string) {
        this.owner = owner;
        this.key = key;

        const ownerName = (owner as any)?.name ?? (owner as any)?.constructor?.name ?? "Anonymous";
        this.id = `${ownerName}.${key}`;
    }
}


export enum MutatationType {
    WAS_INITIALIZED = 1,
    VALUE_CHANGED = 2,
    LIST_ELEMENT_ADDED = 4,
    LIST_ELEMENT_REMOVED = 8,
    LIST_MUTATED = LIST_ELEMENT_ADDED | LIST_ELEMENT_REMOVED,
    MAP_KEY_ADDED = 16,
    MAP_KEY_REMOVED = 32,
    MAP_KEY_CHANGED = 64,
    MAP_MUTATED = MAP_KEY_ADDED | MAP_KEY_REMOVED | MAP_KEY_CHANGED,
    MUTATED = VALUE_CHANGED | LIST_MUTATED | MAP_MUTATED
}

export class UIMutatorsHooks {
    public static readonly MUTATE = new UIHook<[UIMutator<any>, MutatationType, Object, any, any]>(this, "mutate");
}