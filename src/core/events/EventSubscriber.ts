import {EventBase} from "./EventBase";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class EventSubscriber<T extends EventBase> {

    private constructor(public readonly cls: Constructor<T>) {
    }

    public static create<T extends EventBase>(cls: Constructor<T>): EventSubscriber<T> {
        return new EventSubscriber<T>(cls);
    }
}
