/**
 *
 * @author Atzitz Amos
 * @date 3/31/2026
 * @since 1.0.0
 */
export class ThreadedUtils {
    public static isWorkerThread(): boolean {
        return typeof self !== 'undefined' &&
            typeof (self as any).importScripts === 'function';
    }

    public static isMainThread(): boolean {
        return !this.isWorkerThread();
    }

    public static assertWorkerThread() {
        if (!this.isWorkerThread()) {
            throw new Error("Expected to be called from a worker thread.");
        }
    }

    static assertMainThread() {
        if (this.isWorkerThread()) {
            throw new Error("Expected to be called from the main thread.");
        }
    }
}
