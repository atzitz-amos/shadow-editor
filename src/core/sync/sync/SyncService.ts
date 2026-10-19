import {DistantService, DistantServiceImpl} from "../../threaded/service/DistantService";
import {DistantGlobalState} from "../../global/DistantGlobalState";
import {Logger} from "../../logging/logger/LoggerCore";
import {Scheduler} from "../../scheduler/Scheduler";
import {UseLogger} from "../../logging/Logger";

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
    private declare readonly logger: Logger;

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
        Scheduler.every(SyncService.DELAY, () => this.sync());
    }

    private async sync(): Promise<void> {
        try {
            this.logger.info("Starting sync...");

            // No project open -> the main thread returns undefined/null BY VALUE, not a Ref.
            const project = await DistantGlobalState.getCurrentProject();
            if (!project) {
                this.logger.info("Aborting sync: no project...");
                return;
            }
        } catch (e) {
            this.logger.error("Sync failed", e);
        }
    }
}