import {ServiceImpl} from "./Service";
import {Lifecycle} from "../../lifecycle/Lifecycle";
import {PersistedObject} from "../../persistence/transaction/PersistedObject";
import {ThreadedUtils} from "../ThreadedUtils";
import {Launchable} from "../Launchable";

export interface DistantServiceImpl extends ServiceImpl, Launchable {
    /**
     * @returns <code>import.meta.url</code>
     */
    getWorkerScriptPath(): string;
}

/**
 * A decorator to indicate that the class is a Service that desires to run on a webworker thread.
 * It must be a singleton and implement the {@link DistantServiceImpl}
 */
export function DistantService<T extends Constructor<DistantServiceImpl> & {
    getInstance(): InstanceType<T>
}>(ctor: T) {
    // Defer registration to next microtask to avoid "Cannot access before initialization" errors
    queueMicrotask(() => {
        if (!ThreadedUtils.isWorkerThread()) {
            Lifecycle.getInstance().addDistantService(ctor.getInstance());

            if (ctor.prototype.hasOwnProperty("getPersistedKey") && ctor.prototype.hasOwnProperty("persist") && ctor.prototype.hasOwnProperty("load")) {
                Lifecycle.getInstance().addPersistedObject(<PersistedObject<any>>ctor.getInstance());
            }
        } else {
            ctor.getInstance().begin();
        }

        console.log("distant worker: ", ctor.name, ThreadedUtils.isWorkerThread());
    });
}