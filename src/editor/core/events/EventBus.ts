import {EventBase} from "./EventBase";
import {EventSubscriber} from "./EventSubscriber";


export type EventCallback<T extends EventBase> = (event: T) => void;

interface SubscriptionEntry<T extends EventBase> {
    callback: EventCallback<T>;
}

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2025
 * @since 1.0.0
 */
export class EventBus {
    private subscriptions = new Map<Function, Map<object, SubscriptionEntry<any>>>();
    private parentBus: EventBus | null = null;

    constructor(private debugName: string) {
    }

    /**
     * Creates a sub-bus that bubbles its events to this EventBus.
     */
    createSubBus(name: string): EventBus {
        const subBus = new EventBus(name);
        subBus.parentBus = this;
        return subBus;
    }

    /**
     * Gets the parent EventBus, if any.
     */
    getParent(): EventBus | null {
        return this.parentBus;
    }

    /**
     * Get EventBus debug name
     * */
    getDebugName(): string {
        return this.debugName;
    }

    /**
     * Subscribe a callback to an event listener
     * @param subscriber The subscriber object (See: {@link unsubscribe})
     * @param event The EventSubscriber for the corresponding event
     * @param callback The callback to be called when this event is fired
     * */
    subscribe<T extends EventBase>(
        subscriber: object,
        event: EventSubscriber<T>,
        callback: EventCallback<T>
    ): void {
        let subs = this.subscriptions.get(event.cls);
        if (!subs) {
            subs = new Map();
            this.subscriptions.set(event.cls, subs);
        }
        subs.set(subscriber, {callback});
    }

    /**
     * Unsubscribe a subscriber from an event listener
     * @param subscriber The subscriber object to be unsubscribed from (See: {@link subscribe})
     * @param event The EventSubscriber for the corresponding event
     * */
    unsubscribe<T extends EventBase>(
        subscriber: object,
        event: EventSubscriber<T>
    ): void {
        const subs = this.subscriptions.get(event.cls);
        subs?.delete(subscriber);
    }

    /**
     * Publish synchronously an event, prefer using {@link asyncPublish}
     * @param event The event to be published
     * */
    syncPublish<T extends EventBase>(event: T): void {
        this.dispatchLocal(event);

        // Bubble up to parent if any
        if (this.parentBus) {
            this.parentBus.syncPublish(event);
        }
    }

    /**
     * Publish asynchronously an event
     * @param event The event to be published
     * */
    asyncPublish<T extends EventBase>(event: T): void {
        queueMicrotask(() => this.syncPublish(event));
    }

    unsubscribeAll(obj: Object) {
        for (const [eventCls, subs] of this.subscriptions) {
            if (subs.has(obj)) {
                subs.delete(obj);
            }
        }
    }

    private dispatchLocal<T extends EventBase>(event: T) {
        const subs = this.subscriptions.get(event.constructor);
        if (subs) {
            for (const [subscriber, {callback}] of subs) {
                callback.apply(subscriber, [event]);
            }
        }
    }
}