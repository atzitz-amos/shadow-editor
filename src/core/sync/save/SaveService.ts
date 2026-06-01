import {Service} from "../../threaded/service/Service";
import {GlobalState} from "../../global/GlobalState";
import {DocumentSaveRequestEvent} from "../../../editor/core/document/events/DocumentSaveRequestEvent";
import {Logger, UseLogger} from "../../logging/Logger";
import {UnsafeFlagsService} from "../flags/UnsafeFlagsService";
import {UnsafeFlags} from "../flags/UnsafeFlags";

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

        eventBus.subscribe(this, DocumentSaveRequestEvent.SUBSCRIBER, (event) => {
            this.tryAndSave(event);
        });
    }

    private async tryAndSave(event: DocumentSaveRequestEvent) {
        UnsafeFlagsService.clear(UnsafeFlags.FILE_SAVE);

        const file = event.getFile();
        if (!file) {
            return;
        }

        try {
            await file.save(event.getDocument().getTextContent());
            this.logger.debug(`Auto-saved file ${file.getPath().toString()} after modification.`);
        } catch (error) {
            this.logger.error(`Failed to auto-save file ${file.getPath().toString()}:`, error);
        }
    }
}
