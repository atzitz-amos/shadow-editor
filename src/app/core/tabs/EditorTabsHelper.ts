import {ProjectFile} from "../../../core/project/filesystem/tree/ProjectFile";
import {ITab} from "./ITab";
import {TabsManager} from "./TabsManager";
import {EditorTab} from "./EditorTab";
import {EditorDocumentManager} from "../../../editor/core/document/EditorDocumentManager";
import {ActiveProjectHelper} from "../../../core/global/ActiveProjectHelper";
import {EditorURI} from "../../../core/uri/EditorURI";
import {DocumentViewManager} from "../../../editor/core/document/view/DocumentViewManager";
import {FileContentLostError} from "../../../core/project/filesystem/FileContentLostError";
import {IdeDialogUtilsCore} from "../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";

/**
 *
 * @author Atzitz Amos
 * @date 4/30/2026
 * @since 1.0.0
 */
export class EditorTabsHelper {
    /** The files being opened by {@link newTab} */
    private static readonly opening = new Map<ProjectFile, Promise<EditorTab | null>>();
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
            if (tab) TabsManager.getInstance().setActive(tab);
        }
    }

    /**
     * Opens a file in a new tab. Opening a file again while it is being opened, such as by a double click, returns
     * the same tab instead of opening a second one.
     *
     * @returns null when the stored content of the file is lost and the user chose not to open it as empty
     */
    public static newTab(file: ProjectFile): Promise<EditorTab | null> {
        let opening = this.opening.get(file);
        if (!opening) {
            opening = this.openNewTab(file).finally(() => this.opening.delete(file));
            this.opening.set(file, opening);
        }
        return opening;
    }

    private static async openNewTab(file: ProjectFile): Promise<EditorTab | null> {
        try {
            await file.ensureCacheUpToDate();
        } catch (e) {
            if (!(e instanceof FileContentLostError)) throw e;
            if (!await this.acceptLostContent(file, e)) return null;
        }

        const document = EditorDocumentManager.getDocumentForFile(file);
        const tab = new EditorTab(file.getName(), DocumentViewManager.getSavedDocumentView(document));
        TabsManager.getInstance().open(tab, false);

        return tab;
    }

    /**
     * Tells the user that the content of a file is lost, and asks whether to open it as empty, which empties the
     * file for good. Otherwise the file is left as it is, so that opening it later asks again.
     *
     * @returns whether the file was emptied
     */
    private static async acceptLostContent(file: ProjectFile, error: FileContentLostError): Promise<boolean> {
        const accepted = await IdeDialogUtilsCore.confirm(
            `The content of ${file.getName()} is lost`,
            `${error.path} should hold ${error.expectedSize} bytes, but the browser no longer stores them, and they ` +
            `cannot be recovered. Open it as an empty file?`
        );
        if (accepted) await file.save("");
        return accepted;
    }
}
