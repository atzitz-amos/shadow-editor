/**
 * A typed key used to access a value in a {@link DataContext}.
 *
 * Keys are compared by identity, rather than by their name.
 *
 * @author Atzitz Amos
 * @since 1.0.0
 */
export class DataKey<T> {
    private static readonly names = new Set<string>();

    private constructor(public readonly name: string) {
    }

    public static create<T>(name: string): DataKey<T> {
        if (DataKey.names.has(name)) {
            throw new Error(`A data key named "${name}" is already registered.`);
        }
        DataKey.names.add(name);
        return new DataKey<T>(name);
    }

    public toString(): string {
        return this.name;
    }
}
