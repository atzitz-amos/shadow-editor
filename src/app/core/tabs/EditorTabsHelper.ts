import {WorkspaceFile} from "../../../core/workspace/filesystem/tree/WorkspaceFile";
import {ITab} from "./ITab";
import {TabsManager} from "./TabsManager";
import {EditorTab} from "./EditorTab";
import {EditorDocumentManager} from "../../../editor/core/document/EditorDocumentManager";

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

    public static async makeVisible(file: WorkspaceFile): Promise<void> {
        const tabs = this.getTabsForFile(file);
        if (tabs.length > 0) {
            TabsManager.getInstance().open(tabs[0]);
        } else {
            await EditorTabsHelper.newTab(file);
        }
    }

    public static async newTab(file: WorkspaceFile) {
        const document = await EditorDocumentManager.getDocumentForFile(file);
        TabsManager.getInstance().open(new EditorTab(file.getName(), document));
    }
}
