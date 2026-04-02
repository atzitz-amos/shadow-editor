import {SyncState} from "./SyncState";

/**
 *
 * @author Atzitz Amos
 * @date 3/18/2026
 * @since 1.0.0
 */
export type SyncPersistedModel = {
    [id: string]: {
        rootHandle: FileSystemDirectoryHandle | null;

        syncState: SyncState;
        lastSyncedAt: number;
    }
};
