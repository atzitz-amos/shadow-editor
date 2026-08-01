import {WorkspaceFile} from "../../../core/workspace/filesystem/tree/WorkspaceFile";
import {ITab} from "./ITab";
import {TabsManager} from "./TabsManager";
import {EditorTab} from "./EditorTab";
import {EditorDocumentManager} from "../../../editor/core/document/EditorDocumentManager";
import {ActiveWorkspaceHelper} from "../../../core/global/ActiveWorkspaceHelper";
import {EditorURI} from "../../../core/uri/EditorURI";

/**
 *
 * @author Atzitz Amos
 * @date 4/30/2026
 * @since 1.0.0
 */
export class EditorTabsHelper {
    public static getTabsForFile(file: WorkspaceFile): ITab[] {
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
        const file = await ActiveWorkspaceHelper.getInstance()?.getFS().getFile(uri.getPath());
        if (!file) {
            throw new Error(`File not found for URI: ${uri.toString()}`);
        }

        const tabs = this.getTabsForFile(file);
        if (tabs.length > 0) {
            TabsManager.getInstance().open(tabs[0]);
        } else {
            EditorTabsHelper.newTab(file);
        }
    }

    public static newTab(file: WorkspaceFile) {
        const document = EditorDocumentManager.getDocumentForFile(file);
        TabsManager.getInstance().open(new EditorTab(file.getName(), document));
    }
}
