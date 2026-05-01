/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class UIHook<Args extends unknown[] = []> {
    public readonly owner: object;
    public readonly key: string;
    public readonly id: string;

    private readonly type: "hook" = "hook";

    constructor(owner: object, key: string) {
        this.owner = owner;
        this.key = key;

        const ownerName = (owner as any)?.name ?? (owner as any)?.constructor?.name ?? "Anonymous";
        this.id = `${ownerName}.${key}`;
    }
}
