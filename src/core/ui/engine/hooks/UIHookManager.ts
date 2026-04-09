import {UIHook} from "./UIHook";

type HookHandler<Args extends unknown[]> = (...args: Args) => unknown;

type RegisteredSubscription = {
	owner: object;
	methodName?: string | symbol;
	handler: (...args: unknown[]) => unknown;
};

type OwnerSubscription = {
	hook: UIHook<any>;
	subscription: RegisteredSubscription;
};

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class UIHookManager {
	private static instance: UIHookManager;

	private readonly listeners = new Map<UIHook<any>, Set<RegisteredSubscription>>();
	private readonly ownerListeners = new WeakMap<object, Set<OwnerSubscription>>();

	public static getInstance(): UIHookManager {
		if (!this.instance) {
			this.instance = new UIHookManager();
		}
		return this.instance;
	}

	public register<Args extends unknown[]>(
		hook: UIHook<Args>,
		owner: object,
		handler: HookHandler<Args>,
		methodName?: string | symbol
	): () => void {
		const subscriptions = this.getOrCreateHookSubscriptions(hook);
		const subscription: RegisteredSubscription = {
			owner,
			methodName,
			handler: handler as (...args: unknown[]) => unknown
		};

		subscriptions.add(subscription);
		this.addOwnerSubscription(owner, hook, subscription);

		return () => {
			this.unregister(hook, owner, handler);
		};
	}

	public unregister<Args extends unknown[]>(hook: UIHook<Args>, owner: object, handler?: HookHandler<Args>): void {
		const subscriptions = this.listeners.get(hook);
		if (!subscriptions) {
			return;
		}

		for (const subscription of Array.from(subscriptions)) {
			if (subscription.owner !== owner) {
				continue;
			}
			if (handler && subscription.handler !== handler) {
				continue;
			}

			subscriptions.delete(subscription);
			this.removeOwnerSubscription(owner, hook, subscription);
		}

		if (subscriptions.size === 0) {
			this.listeners.delete(hook);
		}
	}

	public clearOwner(owner: object): void {
		const ownerSubscriptions = this.ownerListeners.get(owner);
		if (!ownerSubscriptions) {
			return;
		}

		for (const entry of ownerSubscriptions) {
			const hookSubscriptions = this.listeners.get(entry.hook);
			if (!hookSubscriptions) {
				continue;
			}

			hookSubscriptions.delete(entry.subscription);
			if (hookSubscriptions.size === 0) {
				this.listeners.delete(entry.hook);
			}
		}

		this.ownerListeners.delete(owner);
	}

	public trigger<Args extends unknown[]>(hook: UIHook<Args>, ...args: Args): void {
		const subscriptions = this.listeners.get(hook);
		if (!subscriptions || subscriptions.size === 0) {
			return;
		}

		for (const subscription of Array.from(subscriptions)) {
			(subscription.handler as HookHandler<Args>)(...args);
		}
	}

	private getOrCreateHookSubscriptions(hook: UIHook<any>): Set<RegisteredSubscription> {
		let subscriptions = this.listeners.get(hook);
		if (!subscriptions) {
			subscriptions = new Set<RegisteredSubscription>();
			this.listeners.set(hook, subscriptions);
		}
		return subscriptions;
	}

	private addOwnerSubscription(owner: object, hook: UIHook<any>, subscription: RegisteredSubscription): void {
		let ownerSubscriptions = this.ownerListeners.get(owner);
		if (!ownerSubscriptions) {
			ownerSubscriptions = new Set<OwnerSubscription>();
			this.ownerListeners.set(owner, ownerSubscriptions);
		}

		ownerSubscriptions.add({hook, subscription});
	}

	private removeOwnerSubscription(owner: object, hook: UIHook<any>, subscription: RegisteredSubscription): void {
		const ownerSubscriptions = this.ownerListeners.get(owner);
		if (!ownerSubscriptions) {
			return;
		}

		for (const entry of Array.from(ownerSubscriptions)) {
			if (entry.hook === hook && entry.subscription === subscription) {
				ownerSubscriptions.delete(entry);
			}
		}

		if (ownerSubscriptions.size === 0) {
			this.ownerListeners.delete(owner);
		}
	}

}
