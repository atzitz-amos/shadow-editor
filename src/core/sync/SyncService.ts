import {DistantService, DistantServiceImpl} from "../threaded/service/DistantService";
import {Scheduler} from "../scheduler/Scheduler";
import {RefUtils} from "../threaded/tcsp/ref/RefUtils";

/**
 *
 * @author Atzitz Amos
 * @date 3/27/2026
 * @since 1.0.0
 */
@DistantService
export class SyncService implements DistantServiceImpl {
    private static instance: SyncService;

    private static readonly DELAY = 10 * 60 * 1000;

    public static getInstance(): SyncService {
        if (SyncService.instance === undefined) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }

    getWorkerScriptPath(): string {
        return import.meta.url;
    }

    async begin() {
        this.sync();
        Scheduler.every(SyncService.DELAY, this.sync);

        const windowRef = await RefUtils.getDistantWindowRef();
        await windowRef.addEventListener("visibilitychange", e => {
            console.log(e);
        });
    }

    private sync() {

    }
}
