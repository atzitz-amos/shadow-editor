import {Service} from "../../threaded/service/Service";
import {GlobalState} from "../../global/GlobalState";
import {DocumentModificationEvent} from "../../../editor/core/document/events/DocumentModificationEvent";
import {Scheduler} from "../../scheduler/Scheduler";
import {EditorSaveRequestEvent} from "../../../editor/events/EditorSaveRequestEvent";
import {Logger, UseLogger} from "../../logging/Logger";

/**
 *
 * @author Atzitz Amos
 * @date 3/18/2026
 * @since 1.0.0
 */
@Service
@UseLogger("SaveService")
export class SaveService {
    private static instance: SaveService;

    declare private logger: Logger;

    public constructor() {
    }

    static getInstance(): SaveService {
        if (SaveService.instance === undefined) {
            SaveService.instance = new SaveService();
        }
        return SaveService.instance;
    }

    begin(): void {
        const eventBus = GlobalState.getMainEventBus();

        eventBus.subscribe(this, DocumentModificationEvent.SUBSCRIBER, (event) => {
            Scheduler.debounce(() => {
                let associatedFile = event.getDocument().getAssociatedFile();
                if (associatedFile) eventBus.syncPublish(new EditorSaveRequestEvent(event.getEditor(), associatedFile, Date.now()));
            }, 1000)
        });

        eventBus.subscribe(this, EditorSaveRequestEvent.SUBSCRIBER, (event) => {
            this.tryAndSave(event);
        });
    }

    private async tryAndSave(event: EditorSaveRequestEvent) {
        const file = event.getFile();
        if (!file) {
            return;
        }

        try {
            await file.save();
            this.logger.debug(`Auto-saved file ${file.getPath().toString()} after modification.`);
        } catch (error) {
            this.logger.error(`Failed to auto-save file ${file.getPath().toString()}:`, error);
        }
    }
}
