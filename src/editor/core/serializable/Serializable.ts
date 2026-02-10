export interface Serializable<T> {
    getState(): T;

    loadState(state: T): void;
}