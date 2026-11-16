import {Service} from "../threaded/service/Service";
import {GlobalState} from "../global/GlobalState";
import {CurrentProjectChangedEvent} from "./events/CurrentProjectChangedEvent";
import {Project} from "./Project";
import {WorkspaceManager} from "./workspace/WorkspaceManager";
import {ProjectFile} from "./filesystem/tree/ProjectFile";
import {TabsManager} from "../../app/core/tabs/TabsManager";
import {EditorTabsHelper} from "../../app/core/tabs/EditorTabsHelper";
import {Logger} from "../logging/logger/LoggerCore";

/**
 *
 * @author Atzitz Amos
 * @date 4/16/2026
 * @since 1.0.0
 */
@Service
export class WorkspaceRestorer {
    private static readonly logger: Logger = Logger.for("WorkspaceRestorer");
    private static readonly instance: WorkspaceRestorer = new WorkspaceRestorer();

    public static getInstance(): WorkspaceRestorer {
        return this.instance;
    }

    public begin(): void {
        GlobalState.getMainEventBus().subscribe(this, CurrentProjectChangedEvent.SUBSCRIBER, e => {
            this.restoreWorkspace(e.getProject())
        })
    }

    public restoreWorkspace(project: Project): void {
        setTimeout(async () => {
            const manager = WorkspaceManager.getInstance();
            const workspace = manager.getWorkspace(project);

            const tabs = workspace.getTabs();
            const activeId = workspace.getActiveTab();

            workspace.clear();

            // A tab that cannot be restored is dropped, without preventing the others from being restored
            for (const tab of tabs.values()) {
                try {
                    const file = project.getFS().getEntryById(tab.fileId) as ProjectFile;
                    const iTab = await EditorTabsHelper.newTab(file);
                    if (iTab && tab.tabId === activeId)
                        TabsManager.getInstance().setActive(iTab);
                } catch (e) {
                    WorkspaceRestorer.logger.error(`Could not restore the tab of file ${tab.fileId}`, e);
                }
            }
        }, 500);
    }
}
