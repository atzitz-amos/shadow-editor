import {UseLogger} from "../logging/Logger";
import {DistantService} from "../threaded/service/DistantService";

/**
 *
 * @author Atzitz Amos
 * @date 3/27/2026
 * @since 1.0.0
 */
@DistantService
@UseLogger("SyncService")
export class SyncService {
    private static instance: SyncService;

    public static getInstance(): SyncService {
        if (SyncService.instance === undefined) {
            SyncService.instance = new SyncService();
        }
        return SyncService.instance;
    }

    getLaunchURL(): string {
        return import.meta.url;
    }

    async begin() {
    }

}
