import {PersistedData} from "./PersistedData";
import {Updater} from "./Updater";

/**
 * Represents an object that can be persisted and loaded from a data source.
 * Loading is handled automatically if the object is registered to the Lifecycle (ie. if it's a {@link Service}),
 * but can also be called manually if needed.
 *
 * @author Atzitz Amos
 * @date 12/29/2025
 * @since 1.0.0
 */
export interface PersistedObject<T> {
    getPersistedKey(): string;

    getPersistedModel(): T;

    persist(updater: Updater): void;

    load(data: PersistedData<T>): void;
}
