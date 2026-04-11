import {Service} from "../../../core/threaded/service/Service";
import {ITab} from "./tab/ITab";
import {UIHooks} from "../../../core/ui/engine/hooks/UIHooks";
import {TabHooks} from "./hooks/TabHooks";

/**
 *
 * @author Atzitz Amos
 * @date 4/10/2026
 * @since 1.0.0
 */
@Service
export class TabsManager {
    private static readonly instance: TabsManager = new TabsManager();

    private readonly tabs: Map<string, ITab> = new Map();

    private activeTab: ITab | null = null;

    public static getInstance(): TabsManager {
        return TabsManager.instance;
    }

    begin() {
    }

    open(tab: ITab, setActive: boolean = true) {
        tab.setPosition(this.tabs.size);
        this.tabs.set(tab.getId(), tab);

        UIHooks.trigger(TabHooks.NEW_TAB, tab);

        if (setActive || this.activeTab === null) {
            this.setActive(tab);
        }
    }

    close(tab: ITab) {
        this.tabs.delete(tab.getId());
    }

    setActive(tab: ITab) {
        if (this.activeTab?.getId() === tab.getId()) return;
        if (this.activeTab) {
            this.activeTab.setActive(false);
            UIHooks.trigger(TabHooks.TAB_HIDE, this.activeTab);
        }

        this.activeTab = tab;
        tab.setActive(true);
        UIHooks.trigger(TabHooks.TAB_ACTIVE, tab);
    }

    getActiveTab(): ITab | null {
        return this.activeTab;
    }

    getAllTabs(): ITab[] {
        return Array.from(this.tabs.values()).sort((a, b) => a.getPosition() - b.getPosition());
    }
}
