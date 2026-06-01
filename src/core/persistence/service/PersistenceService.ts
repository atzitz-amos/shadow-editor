import {Service} from "../../threaded/service/Service";
import {Scheduler} from "../../scheduler/Scheduler";
import {GlobalState} from "../../global/GlobalState";
import {UnsafeFlagsService} from "../../sync/flags/UnsafeFlagsService";
import {UnsafeFlags} from "../../sync/flags/UnsafeFlags";

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
        UnsafeFlagsService.flag(UnsafeFlags.PERSISTENCE);

        const invoke = () => {
            Scheduler.idleTask(() => {
                if (!UnsafeFlagsService.clear(UnsafeFlags.PERSISTENCE)) {
                    return;
                }

                console.log("Triggering persist...");
                GlobalState.getLifecycle().triggerPersist();
            })
        }

        Scheduler.every(10_000, () => invoke);
        invoke();
    }
}
