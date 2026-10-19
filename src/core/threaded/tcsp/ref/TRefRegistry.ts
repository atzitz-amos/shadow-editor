import {GlobalState} from "../../../global/GlobalState";
import {UUIDHelper} from "../../../../editor/utils/UUIDHelper";
import {ThreadedUtils} from "../../ThreadedUtils";
import {Logger} from "../../../logging/logger/LoggerCore";

/**
 * Holds every object that has been handed out by reference.
 *
 * - "Pinned" entries (GlobalState, Logger, window...) are permanent roots and can never be freed
 *   by a remote proxy being garbage collected.
 * - Everything else is stored under a fresh UUID and removed when the remote side frees it.
 *
 * @author Atzitz Amos
 * @date 4/5/2026
 * @since 1.0.0
 */
export class TRefRegistry {
    private static readonly globals = globalThis as unknown as Record<string, unknown>;

    private readonly objects = new Map<string, unknown>();
    private readonly pinned = new Set<string>();

    public constructor() {
        this.pin("GlobalState", GlobalState);
        this.pin("Logger", Logger);
        if (ThreadedUtils.isMainThread()) this.pin("window", window);
    }

    /** Resolves a registered id, falling back to a global of that name. */
    get(id: string): any {
        return this.objects.has(id) ? this.objects.get(id) : TRefRegistry.globals[id];
    }

    isDefined(id: string): boolean {
        if (this.objects.has(id)) {
            return this.objects.get(id) != null;
        }
        return Object.prototype.hasOwnProperty.call(globalThis, id) && TRefRegistry.globals[id] != null;
    }

    save(obj: unknown): string {
        const uuid = UUIDHelper.newUUID();
        this.objects.set(uuid, obj);
        return uuid;
    }

    /** Returns the id under which the named root / global can be addressed. */
    getOrSave(name: string): string {
        if (this.objects.has(name)) {
            return name;
        }

        const obj = TRefRegistry.globals[name];
        if (obj === undefined) {
            throw new Error(`Could not find object "${name}" in registry or globalThis`);
        }
        return this.save(obj);
    }

    delete(id: string): void {
        if (this.pinned.has(id)) return;
        this.objects.delete(id);
    }

    private pin(name: string, value: unknown): void {
        this.objects.set(name, value);
        this.pinned.add(name);
    }
}