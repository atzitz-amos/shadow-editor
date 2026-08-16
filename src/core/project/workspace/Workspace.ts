import {Serializable, SerializableType} from "../../persistence/serializable/Serializable";
import {WorkspaceTabState} from "./WorkspaceTabState";
import {EditorTab} from "../../../app/core/tabs/EditorTab";

/**
 *
 * @author Atzitz Amos
 * @date 8/9/2026
 * @since 1.0.0
 */
export class Workspace implements Serializable {
    private activeTab: string | null = null;
    private tabs: Map<string, WorkspaceTabState> = new Map();

    constructor() {
    }

    public static deserializer(data: any) {
        const workspace = new Workspace();
        workspace.setActive(data.activeTab);
        for (const [id, state] of data.tabs.entries()) {
            workspace.tabs.set(id, state);
        }
        return workspace;
    }

    setActive(tab: string) {
        this.activeTab = tab;
    }

    updateTab(tab: EditorTab) {
        const file = tab.getDocument().getAssociatedFile();
        if (!file) return;

        this.tabs.set(tab.getId(), {
            tabId: tab.getId(),
            fileId: file.getId(),
            order: tab.getPosition()
        });
    }

    closeTab(tab: EditorTab) {
        this.tabs.delete(tab.getId());
        if (tab.isActive()) {
            this.activeTab = null;
        }
    }

    serialize(): SerializableType {
        return {
            activeTab: this.activeTab,
            tabs: this.tabs
        }
    }

    getTabs() {
        return this.tabs;
    }

    getActiveTab(): string | null {
        return this.activeTab;
    }

    clear() {
        this.activeTab = null;
        this.tabs = new Map<string, WorkspaceTabState>();
    }
}
