import {CriticalErrorRenderer} from "./renderer/CriticalErrorRenderer";

/**
 * Method decorator that catches any exception thrown by the decorated method
 * and displays a full-screen critical error overlay with the stack trace.
 *
 * Works with both synchronous and async methods. The error is also re-logged
 * to the console for developer tools access.
 *
 * @example
 * ```typescript
 * class MyService {
 *     @Critical
 *     initialize() {
 *         // If this throws, a critical error overlay is shown
 *     }
 *
 *     @Critical
 *     async loadData() {
 *         // Also works with async methods
 *     }
 * }
 * ```
 *
 * @author Atzitz Amos
 * @date 2/19/2026
 * @since 1.0.0
 */
export function Critical<This, Args extends any[], Return>(
    original: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
    const methodName = String(context.name);

    return function (this: This, ...args: Args) {
        const source = `${(this as any).constructor?.name ?? "Unknown"}.${methodName}`;

        try {
            const result = original.apply(this, args);

            // Handle async methods
            if (result instanceof Promise) {
                return result.catch((error: unknown) => {
                    const err = error instanceof Error ? error : new Error(String(error));
                    console.error(`[Critical] ${source}:`, err);
                    CriticalErrorRenderer.showOverlay(source, err);
                });
            }

            return result;
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error(`[Critical] ${source}:`, err);
            CriticalErrorRenderer.showOverlay(source, err);
        }
    };
}

