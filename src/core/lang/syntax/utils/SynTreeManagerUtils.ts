import {Editor} from "../../../../editor/Editor";
import {SynFile} from "../api/filesystem/SynFile";
import {GlobalState} from "../../../global/GlobalState";
import {SynTreeChangedEvent} from "../../../../editor/core/lang/events/SynTreeChangedEvent";

/**
 *
 * @author Atzitz Amos
 * @date 6/26/2026
 * @since 1.0.0
 */
export class SynTreeManagerUtils {

    private static pendingPromise: Promise<SynFile> | null = null;

    public static isSynTreeDirty(editor: Editor): boolean {
        return editor.getLangService().isSynTreeDirty();
    }

    public static async awaitSynTreeReady(editor: Editor): Promise<SynFile> {
        // TODO: Actually take the editor in account
        if (!SynTreeManagerUtils.isSynTreeDirty(editor))
            return editor.getLangService().getSynFile();

        if (SynTreeManagerUtils.pendingPromise)
            return SynTreeManagerUtils.pendingPromise;

        SynTreeManagerUtils.pendingPromise = new Promise<SynFile>((resolve) => {
            const bus = GlobalState.getMainEventBus();

            bus.subscribe(this, SynTreeChangedEvent.SUBSCRIBER, (e) => {
                this.unsub();
                SynTreeManagerUtils.pendingPromise = null;
                resolve(editor.getLangService().getSynFile());
            });

            if (!SynTreeManagerUtils.isSynTreeDirty(editor)) {
                this.unsub();
                SynTreeManagerUtils.pendingPromise = null;
                resolve(editor.getLangService().getSynFile());
            }
        });

        return SynTreeManagerUtils.pendingPromise;
    }

    private static unsub() {
        GlobalState.getMainEventBus().unsubscribe(this, SynTreeChangedEvent.SUBSCRIBER);
    }
}
