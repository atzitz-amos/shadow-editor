import {Closeable, CloseOn} from "../../../core/ui/api/Closeable";

/**
 * @author Atzitz Amos
 * @date 6/1/2026
 * @since 1.0.0
 */
export class EditorKeysHelper {
    private static readonly registry = new Map<CloseOn, Set<Closeable>>();

    /**
     * Registers a {@link Closeable
     *} to be automatically closed when the given {@link CloseOn} flag is notified.
     * The closeable is removed from the registry once closed.
     */
    static closeOn(closeable: Closeable, on: CloseOn): void {
        if (!EditorKeysHelper.registry.has(on)) {
            EditorKeysHelper.registry.set(on, new Set());
        }
        EditorKeysHelper.registry.get(on)!.add(closeable);
    }

    /**
     * Force-removes a {@link Closeable
     *} from the registry without closing it.
     */
    static notifyClosed(closeable: Closeable): void {
        for (const closeables of EditorKeysHelper.registry.values()) {
            closeables.delete(closeable);
        }
    }

    /**
     * Notifies the helper that a {@link CloseOn} event has occurred.
     * All closeables registered under any matching flag are closed and removed.
     */
    static notify(closeOn: CloseOn): void {
        for (const [flag, closeables] of EditorKeysHelper.registry) {
            if (closeOn & flag) {
                closeables.forEach(c => c.close());
            }
        }
    }
}