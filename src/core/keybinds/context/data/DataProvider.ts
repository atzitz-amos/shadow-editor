/**
 * Supplies a value for a lazily populated data context entry.
 */
export interface DataProvider<T> {
    get(): T;
}
