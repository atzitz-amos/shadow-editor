import {UIHook} from "./UIHook";
import {UIHookManager} from "./UIHookManager";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class UIHooks {
    private static readonly manager = UIHookManager.getInstance();

    public static react<This extends object, Args extends unknown[]>(hook: UIHook<Args>);
    public static react<This extends object, Args extends unknown[]>(...hooks: UIHook<Args>[]);
    public static react<This extends object, Args extends unknown[]>(hook: UIHook<Args> | UIHook<Args>[]) {
        return (
            original: (this: This, ...args: Args) => unknown,
            context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => unknown>
        ): void => {
            if (context.private) {
                throw new Error("@UIHooks.react cannot be used on private methods.");
            }

            if (Array.isArray(hook)) {
                for (const h of hook) {
                    doAddHook(h);
                }
            } else doAddHook(hook);

            function doAddHook(hook: UIHook<Args>) {
                context.addInitializer(function (this: This) {
                    UIHooks.manager.register(
                        hook,
                        this,
                        (...args: Args) => original.apply(this, args),
                        context.name
                    );
                });

            }
        };
    }

    public static trigger<Args extends unknown[]>(hook: UIHook<Args>, ...args: Args): void {
        this.manager.trigger(hook, ...args);
    }

    public static on<Args extends unknown[]>(hook: UIHook<Args>, owner: object, handler: (...args: Args) => unknown): () => void {
        return this.manager.register(hook, owner, handler);
    }

    public static off<Args extends unknown[]>(hook: UIHook<Args>, owner: object, handler?: (...args: Args) => unknown): void {
        this.manager.unregister(hook, owner, handler);
    }

    public static clearOwner(owner: object): void {
        this.manager.clearOwner(owner);
    }

}
