import {GlobalState} from "../../../global/GlobalState";
import {UUIDHelper} from "../../../../editor/utils/UUIDHelper";
import {ThreadedUtils} from "../../ThreadedUtils";

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
        if (ThreadedUtils.isMainThread()) this.registry.set("window", window);
    }


    get(uuid: string) {
        return this.registry.get(uuid) ?? window[uuid];
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
