import {ServiceImpl} from "./Service";

export interface DistantServiceImpl extends ServiceImpl {
    getLaunchURL(): string;
}

/**
 * A decorator to indicate that the class is a Service that desires to run on a webworker thread.
 * It must be a singleton and implement the {@link DistantServiceImpl}
 */
export function DistantService<T extends Constructor<DistantServiceImpl> & {
    getInstance(): InstanceType<T>
}>(ctor: T) {
}