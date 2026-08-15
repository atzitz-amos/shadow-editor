import {ProjectFile} from "../../../core/project/filesystem/tree/ProjectFile";
import {ITab} from "./ITab";
import {TabsManager} from "./TabsManager";
import {EditorTab} from "./EditorTab";
import {EditorDocumentManager} from "../../../editor/core/document/EditorDocumentManager";
import {ActiveProjectHelper} from "../../../core/global/ActiveProjectHelper";
import {EditorURI} from "../../../core/uri/EditorURI";
import {DocumentViewManager} from "../../../editor/core/document/view/DocumentViewManager";

/**
 *
 * @author Atzitz Amos
 * @date 4/30/2026
 * @since 1.0.0
 */
export class EditorTabsHelper {
    public static getTabsForFile(file: ProjectFile): ITab[] {
        const result: ITab[] = [];
        for (const tab of TabsManager.getInstance().getAllTabs()) {
            if (!(tab instanceof EditorTab)) continue;
            let f = tab.getDocument().getAssociatedFile();
            if (f && f.getPath().equals(file.getPath())) {
                result.push(tab);
            }
        }
        return result;
    }

    public static async makeVisible(uri: EditorURI): Promise<void> {
        const file = ActiveProjectHelper.getInstance()?.getFS().getFile(uri.getPath());
        if (!file) {
            throw new Error(`File not found for URI: ${uri.toString()}`);
        }

        const tabs = this.getTabsForFile(file);
        if (tabs.length > 0) {
            TabsManager.getInstance().open(tabs[0]);
        } else {
            const tab = await EditorTabsHelper.newTab(file);
            TabsManager.getInstance().setActive(tab);
        }
    }

    public static async newTab(file: ProjectFile) {
        await file.ensureCacheUpToDate();

        const document = EditorDocumentManager.getDocumentForFile(file);
        const tab = new EditorTab(file.getName(), DocumentViewManager.getSavedDocumentView(document));
        TabsManager.getInstance().open(tab, false);

        return tab;
    }
}
