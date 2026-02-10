import {PersistedData} from "./PersistedData";
import {Updater} from "./Updater";

/**
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
