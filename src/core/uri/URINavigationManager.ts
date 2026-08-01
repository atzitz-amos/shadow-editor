import {EditorURI} from "./EditorURI";
import {URITargetType} from "./URITargetType";
import {UseLogger} from "../logging/logger/LoggerDecorators";
import {Logger} from "../logging/logger/LoggerCore";
import {EditorTabsHelper} from "../../app/core/tabs/EditorTabsHelper";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
@UseLogger("URIManager")
export class URINavigationManager {
    private static instance: URINavigationManager;

    declare private readonly logger: Logger;

    public static getInstance(): URINavigationManager {
        if (!URINavigationManager.instance) {
            URINavigationManager.instance = new URINavigationManager();
        }
        return URINavigationManager.instance;
    }

    public static async navigateAsync(uri: EditorURI): Promise<void> {
        await this.getInstance().navigateAsync(uri);
    }

    public async navigateAsync(uri: EditorURI): Promise<void> {
        if (uri.getTarget() == URITargetType.FILE) {
            await EditorTabsHelper.makeVisible(uri);
        }
    }
}
