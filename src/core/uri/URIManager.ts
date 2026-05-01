import {EditorURI} from "./EditorURI";
import {URITargetType} from "./URITargetType";
import {CurrentWorkspaceHelper} from "../global/CurrentWorkspaceHelper";
import {UseLogger} from "../logging/logger/LoggerDecorators";
import {Logger} from "../logging/logger/LoggerCore";
import {EditorTabsHelper} from "../../app/ui/tabs/EditorTabsHelper";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
@UseLogger("URIManager")
export class URIManager {
    private static instance: URIManager;

    declare private readonly logger: Logger;

    public static getInstance(): URIManager {
        if (!URIManager.instance) {
            URIManager.instance = new URIManager();
        }
        return URIManager.instance;
    }

    public static async openAsync(uri: EditorURI): Promise<void> {
        await this.getInstance().openAsync(uri);
    }

    public async openAsync(uri: EditorURI): Promise<void> {
        if (uri.getTarget() == URITargetType.FILE) {
            const file = await CurrentWorkspaceHelper.getInstance()?.getFS().getFile(uri.getPath());
            if (!file) {
                this.logger.error("FATAL: File not found for URI: " + uri.toString());
                return;
            }

            await EditorTabsHelper.makeVisible(file);
        }
    }
}
