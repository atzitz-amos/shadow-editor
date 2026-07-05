import {Launchable} from "../Launchable";
import {ThreadedUtils} from "../ThreadedUtils";

export interface WebWorkerImpl extends Launchable {
    run(): void;
}

/**
 * A decorator to indicate that the class is a Service that desires to run on a webworker thread.
 * It must be a singleton and implement the {@link DistantServiceImpl}
 */
export function WebWorker<T extends Constructor<WebWorkerImpl> & {
    getInstance(): InstanceType<T>
}>(ctor: T, _context: ClassDecoratorContext<T>) {
    // Defer registration to next microtask to avoid "Cannot access before initialization" errors
    queueMicrotask(() => {
        if (ThreadedUtils.isWorkerThread()) {
            ctor.getInstance().run();
        }
    });
}