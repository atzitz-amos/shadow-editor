/**
 *
 * @author Atzitz Amos
 * @date 3/18/2026
 * @since 1.0.0
 */
export class Scheduler {

    private static readonly taskQueue: Map<string, NodeJS.Timeout>;


    public static after(delay: number, task: () => void): NodeJS.Timeout {
        return setTimeout(task, delay);
    }

    public static defer(task: () => void): NodeJS.Timeout {
        return setTimeout(task, 0);
    }

    public static queueMicrotask(task: () => void): void {
        if (typeof queueMicrotask === "function") {
            queueMicrotask(task);
        } else {
            Promise.resolve().then(task).catch(e => setTimeout(() => {
                throw e;
            }, 0));
        }
    }

    public static async yield(): Promise<void> {
        // @ts-ignore
        if ("scheduler" in window && typeof window.scheduler.yield === "function") {
            // @ts-ignore
            return await window.scheduler.yield();
        }
        return await new Promise(resolve => setTimeout(resolve, 0));
    }

    /**
     * Debounces a task, ensuring it is only executed after a specified delay has passed since the last time it was invoked.
     * If the task is invoked again before the delay has passed, the previous invocation is canceled and the delay is reset.
     *
     * @param task The task to be debounced.
     * @param delay The delay in milliseconds to wait before executing the task after the last invocation.
     * @return A NodeJS.Timeout object that can be used to cancel the scheduled task if needed.
     */
    public static debounce(task: () => void, delay: number): NodeJS.Timeout {
        let key = task.toString();

        if (this.taskQueue.has(key)) {
            clearTimeout(this.taskQueue.get(key));
        }
        const timeoutId = setTimeout(() => {
            task();
            this.taskQueue.delete(key);
        }, delay);
        this.taskQueue.set(key, timeoutId);

        return timeoutId;
    }

    public static throttle(task: () => void, delay: number): boolean {
        let key = task.toString();

        if (this.taskQueue.has(key)) {
            return false;
        }
        task();
        const timeoutId = setTimeout(() => {
            this.taskQueue.delete(key);
        }, delay);
        this.taskQueue.set(key, timeoutId);

        return true;
    }

}
