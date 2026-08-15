import {PersistenceModel} from "../../PersistenceModel";
import {Cell} from "./Cell";
import {PersistedOptions} from "./PersistedOptions";


/**
 * Represents a persisted object value. Cells should never be instantiated directly,
 * use {@link PersistenceModel.createCell()} instead.
 * <p>
 * Can be accessed and set synchronously, modifications will be queued and executed later.
 *
 * @author Atzitz Amos
 * @date 8/12/2026
 * @since 1.0.0
 */
export class ValueCell<T extends object = object> implements Cell {
    private value: T;
    private readonly model: PersistenceModel;
    private readonly key: string;
    private readonly options?: PersistedOptions;

    private readonly mutable: boolean;

    public constructor(model: PersistenceModel, key: string, initial: T, options?: PersistedOptions) {
        this.model = model;
        this.key = key;
        this.options = options;
        this.value = initial;

        this.mutable = this.options?.mutable || false;
    }

    init(value: T) {
        this.value = this.make(value);
    }

    setValue(value: T) {
        this.value = this.make(value);

        this.model.persistCell(this);
    }

    getValue(): T {
        return this.value;
    }

    getKey() {
        return this.key;
    }

    getOptions(): PersistedOptions | undefined {
        return this.options;
    }

    getVersion() {
        return this.options?.version ?? 1;
    }

    private make(value: T) {
        if (this.mutable) {
            // intercept modifications on the object and trigger persistence
            return new Proxy(value, {
                set: (target, prop, newValue) => {
                    target[prop as keyof T] = newValue;
                    this.model.persistCell(this);
                    return true;
                }
            });
        }

        return value;
    }
}
