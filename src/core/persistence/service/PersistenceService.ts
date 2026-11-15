import {Service} from "../../threaded/service/Service";
import {Scheduler} from "../../scheduler/Scheduler";
import {UnsafeFlagsService} from "../flags/UnsafeFlagsService";
import {UnsafeFlags} from "../flags/UnsafeFlags";

/**
 *
 * @author Atzitz Amos
 * @date 5/31/2026
 * @since 1.0.0
 */
@Service
export class PersistenceService {
    private static readonly instance = new PersistenceService();

    public static getInstance(): PersistenceService {
        return this.instance;
    }

    begin() {
        this.requirePersistence();
    }

    requirePersistence() {
        UnsafeFlagsService.flag(UnsafeFlags.PERSISTENCE);
        Scheduler.idleTask(() => {
            if (!UnsafeFlagsService.clear(UnsafeFlags.PERSISTENCE)) {
                return;
            }
        })
    }
}
