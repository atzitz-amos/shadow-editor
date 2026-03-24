/**
 *
 * @author Atzitz Amos
 * @date 3/17/2026
 * @since 1.0.0
 */
export enum SyncState {
    UNLINKED, 			// no handle was ever provided
    DISCONNECTED,		// project has been linked to the LocalFS once but the handle is lost
    MERGE_CONFLICT,		// project has been linked but saving is temporarly paused because of unresovled merge conflicts
    UNSAVED, 			// project is linked but changes were not saved (VirtualFS >> LocalFS)
    SAVED,				// project is linked and changes were saved (VirtualFS == LocalFS)
    SYNCING				// no conflicts were previously detected, syncing has started
}
