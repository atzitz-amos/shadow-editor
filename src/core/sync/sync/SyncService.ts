import {DistantService, DistantServiceImpl} from "../../threaded/service/DistantService";
import {Scheduler} from "../../scheduler/Scheduler";
import {Logger} from "../../logging/logger/LoggerCore";
import {UseLogger} from "../../logging/logger/LoggerDecorators";
import {DistantGlobalState} from "../../global/DistantGlobalState";

/**
 *
 * @author Atzitz Amos
 * @date 3/27/2026
 * @since 1.0.0
 */
@DistantService
@UseLogger("SyncService")
export class SyncService implements DistantServiceImpl {
    private static instance: SyncService;
    private static readonly DELAY = 10 * 60 * 1000;

    declare private readonly logger: Logger;

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
        await this.sync();
        Scheduler.every(SyncService.DELAY, this.sync);
    }

    private async sync() {
        this.logger.info("Starting sync...");

        const workspace = await DistantGlobalState.getCurrentWorkspace();
        const fs = await workspace.getFS();

        console.log(await fs.recursiveGetAllFiles());
    }
}
