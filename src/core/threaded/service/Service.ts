import {Lifecycle} from "../../lifecycle/Lifecycle";
import {ThreadedUtils} from "../ThreadedUtils";
import {PersistedObject} from "../../persistence/objects/PersistedObject";

/**
 * Represents a service. Must be a singleton, which will be registered to the Lifecycle of the app.
 * Must be decorated by @service to work as intended
 *
 * @author Atzitz Amos
 * @date 12/29/2025
 * @since 1.0.0
 */
export interface ServiceImpl {
    /**
     * Called during the ServiceBeginPhase of startup.
     * Can be async if the service needs to perform async initialization.
     */
    begin(): void | Promise<void>;
}

/**
 * A decorator to indicate that the class is a Service. It must be a singleton and implement the ServiceImpl interface.
 * Uses queueMicrotask to defer registration until after module initialization to avoid circular dependency issues.
 **/
export function Service<T extends Constructor<ServiceImpl> & { getInstance(): InstanceType<T> }>(
    ctor: T,
    _context: ClassDecoratorContext<T>
) {
    // Defer registration to next microtask to avoid "Cannot access before initialization" errors
    queueMicrotask(() => {
        if (!ThreadedUtils.isWorkerThread()) {
            Lifecycle.getInstance().addService(ctor.getInstance());

            if (ctor.prototype.hasOwnProperty("getPersistedKey") && ctor.prototype.hasOwnProperty("persist") && ctor.prototype.hasOwnProperty("load")) {
                Lifecycle.getInstance().addPersistedObject(<PersistedObject>ctor.getInstance());
            }
        }
    });
}

/**
 * A decorator to indicate that the class is a persisted object provider. It expects a singleton
 * that implements PersistedObject<T> and will register only the persisted object with the Lifecycle.
 * Uses queueMicrotask to defer registration until after module initialization to avoid circular dependency issues.
 */
export function PersistedClass<T extends Constructor<PersistedObject> & { getInstance(): InstanceType<T> }>(
    ctor: T,
    _context: ClassDecoratorContext<T>
) {
    // Defer registration to next microtask to avoid "Cannot access before initialization" errors

    queueMicrotask(() => {
        if (!ThreadedUtils.isWorkerThread()) {
            Lifecycle.getInstance().addPersistedObject(<PersistedObject>ctor.getInstance());
        }
    });
}

