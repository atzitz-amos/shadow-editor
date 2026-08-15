import {Persisted} from "../../persistence/objects/Persisted";
import {Workspace} from "./Workspace";
import {Project} from "../Project";
import {UIHooks} from "../../ui/engine/listeners/hooks/UIHooks";
import {TabHooks} from "../../../app/core/UICommonHooks";
import {ITab} from "../../../app/core/tabs/ITab";
import {ActiveProjectHelper} from "../../global/ActiveProjectHelper";
import {EditorTab} from "../../../app/core/tabs/EditorTab";

/**
 *
 * @author Atzitz Amos
 * @date 8/14/2026
 * @since 1.0.0
 */
export class WorkspaceManager {
    private static readonly declare triggerPersist: () => void;

    @Persisted({
        deserializer: d => d.use(Workspace, Workspace.deserializer)
    })
    private static accessor workspaces: Map<string, Workspace> = new Map<string, Workspace>();

    private static readonly instance: WorkspaceManager = new WorkspaceManager();

    private constructor() {
    }

    public static getInstance(): WorkspaceManager {
        return this.instance;
    }

    public getWorkspace(project: Project) {
        if (!WorkspaceManager.workspaces.has(project.getName())) {
            WorkspaceManager.workspaces.set(project.getName(), new Workspace());
        }
        return WorkspaceManager.workspaces.get(project.getName())!;
    }

    @UIHooks.react(TabHooks.TAB_ACTIVE)
    private onTabActive(tab: ITab) {
        const project = ActiveProjectHelper.getInstance()!;
        if (!project || !(tab instanceof EditorTab)) return

        this.getWorkspace(project).setActive(tab.getId());
        WorkspaceManager.triggerPersist();
    }

    @UIHooks.react(TabHooks.NEW_TAB)
    private onNewTab(tab: ITab) {
        const project = ActiveProjectHelper.getInstance()!;
        if (!project || !(tab instanceof EditorTab)) return

        this.getWorkspace(project).updateTab(tab);
        WorkspaceManager.triggerPersist();
    }

    @UIHooks.react(TabHooks.TAB_CLOSE)
    private onTabClose(tab: ITab) {
        const project = ActiveProjectHelper.getInstance()!;
        if (!project || !(tab instanceof EditorTab)) return

        this.getWorkspace(project).closeTab(tab);
        WorkspaceManager.triggerPersist();
    }
}
