import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {UIHooks} from "../../../../../../core/ui/engine/hooks/UIHooks";
import {ITab} from "../../../../tabs/tab/ITab";
import {TabHooks} from "../../../../../core/UICommonHooks";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorTabs extends UIComponent {
    private readonly tabs: Map<string, ITab> = new Map();
    private readonly tabsElement: Map<string, HTMLElement> = new Map();

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-tabs", root));
    }

    draw(): void {
        this.setInnerHTML("");
        this.tabsElement.clear();
        for (const tab of this.tabs.values()) {
            let tabElement = HTMLUtils.createDiv("column-tab");
            tabElement.textContent = tab.getTitle();
            if (tab.isActive()) {
                tabElement.classList.add("column-tab-active");
            }
            this.addHtmlElement(tabElement);
            this.tabsElement.set(tab.getId(), tabElement);
        }
    }

    @UIHooks.react(TabHooks.NEW_TAB)
    onNewTab(tab: ITab) {
        this.tabs.set(tab.getId(), tab);
        this.draw();
    }

    @UIHooks.react(TabHooks.TAB_ACTIVE)
    onTabActive(tab: ITab) {
        this.draw();
    }

    @UIHooks.react(TabHooks.TAB_HIDE)
    onTabHide() {
    }

    @UIHooks.react(TabHooks.TAB_CLOSE)
    onTabClose(tab: ITab) {
        this.tabsElement.get(tab.getId())?.remove();

        this.tabsElement.delete(tab.getId());
        this.tabs.delete(tab.getId());
    }
}
