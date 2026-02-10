import {EventBase} from "./EventBase";
import {EventSubscriber} from "./EventSubscriber";
import {BubbleDirection} from "./BubbleDirection";


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
    private static MAIN_EVENT_BUS: EventBus = new EventBus("MainEventBus");
    private subscriptions = new Map<Function, Map<object, SubscriptionEntry<any>>>();

    private parentBus: EventBus | null = null;
    private children: EventBus[] = [];

    constructor(private debugName: string) {
        if (debugName !== "MainEventBus") {
            EventBus.MAIN_EVENT_BUS.children.push(this);
            this.parentBus = EventBus.MAIN_EVENT_BUS;
        }
    }

    public static getMainEventBus() {
        return EventBus.MAIN_EVENT_BUS;
    }

    /**
     * Creates a sub-bus that bubbles its events to this EventBus.
     */
    createSubBus(name: string): EventBus {
        const subBus = new EventBus(name);
        subBus.parentBus = this;
        this.children.push(subBus);
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
    ): EventBus {
        let subs = this.subscriptions.get(event.cls);
        if (!subs) {
            subs = new Map();
            this.subscriptions.set(event.cls, subs);
        }
        subs.set(subscriber, {callback});
        return this;
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

        if (typeof event.getBubbleDirection === "function") {
            if (event.getBubbleDirection() & BubbleDirection.BUBBLE_DOWN) {
                for (const childBus of this.children) {
                    childBus.bubbleDown(event);
                }
            }

            if (event.getBubbleDirection() & BubbleDirection.BUBBLE_UP) {
                // Bubble up to parent if any
                if (this.parentBus) {
                    this.parentBus.bubbleUp(event);
                }
            }
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

    private bubbleUp<T extends EventBase>(event: T): void {
        this.dispatchLocal(event);
        if (typeof event.getBubbleDirection === "function") {
            if (event.getBubbleDirection() & BubbleDirection.BUBBLE_UP) {
                // Bubble up to parent if any
                if (this.parentBus) {
                    this.parentBus.syncPublish(event);
                }
            }
        }
    }

    private bubbleDown<T extends EventBase>(event: T): void {
        this.dispatchLocal(event);

        if (typeof event.getBubbleDirection === "function") {
            if (event.getBubbleDirection() & BubbleDirection.BUBBLE_DOWN) {
                for (const childBus of this.children) {
                    childBus.syncPublish(event);
                }
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