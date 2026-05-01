import {GlobalState} from "../../../global/GlobalState";
import {UUIDHelper} from "../../../../editor/utils/UUIDHelper";
import {ThreadedUtils} from "../../ThreadedUtils";
import {Logger} from "../../../logging/logger/LoggerCore";

/**
 *
 * @author Atzitz Amos
 * @date 4/5/2026
 * @since 1.0.0
 */
export class TRefRegistry {
    private readonly registry: Map<string, any> = new Map();

    public constructor() {
        this.registry.set("GlobalState", GlobalState);
        this.registry.set("Logger", Logger);
        if (ThreadedUtils.isMainThread()) this.registry.set("window", window);
    }


    get(uuid: string) {
        return this.registry.get(uuid) ?? window[uuid];
    }

    isDefined(uuid: string): boolean {
        if (this.registry.has(uuid)) {
            const value = this.registry.get(uuid);
            return value !== null && value !== undefined;
        }

        if (Object.prototype.hasOwnProperty.call(window, uuid)) {
            const value = (window as any)[uuid];
            return value !== null && value !== undefined;
        }

        return false;
    }

    save(obj: any): string {
        const uuid = UUIDHelper.newUUID();
        this.registry.set(uuid, obj);
        return uuid;
    }

    getOrSave(name: string): string {
        if (this.registry.has(name)) {
            return name;
        }
        const obj = window[name];
        if (obj === undefined) {
            throw new Error(`Could not find object with name ${name} in registry or global window`);
        }
        return this.save(obj);
    }

    delete(uuid: string) {
        this.registry.delete(uuid);
    }
}
