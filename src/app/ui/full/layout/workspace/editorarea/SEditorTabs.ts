import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {UIHooks} from "../../../../../../core/ui/engine/listeners/hooks/UIHooks";
import {ITab} from "../../../../../core/tabs/ITab";
import {TabHooks} from "../../../../../core/UICommonHooks";
import {TabsManager} from "../../../../../core/tabs/TabsManager";
import {GlobalState} from "../../../../../../core/global/GlobalState";
import {EntryRenamedEvent} from "../../../../../../core/project/events/EntryRenamedEvent";
import {ContextResolver} from "../../../../../../core/keybinds/context/ContextResolver";
import {CommonDataKeys} from "../../../../../../core/keybinds/context/data/CommonDataKeys";
import {ContextMenuElement} from "../../../../../../core/ui/lib/menu/impl/ContextMenu";
import {EditorTabContextMenuActionGroup} from "../../../../../core/tabs/actions/EditorTabContextMenuActionGroup";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorTabs extends UIComponent {
    private activeTab: ITab | null = null;

    private readonly tabs: Map<string, ITab> = new Map();
    private readonly tabsElement: Map<string, HTMLElement> = new Map();

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-tabs", root));

        ContextResolver.registerGlobal({
            provide: key => key == CommonDataKeys.OPENED_EDITOR_TAB
                ? this.activeTab
                : undefined
        });

        GlobalState.getMainEventBus().subscribe(this, EntryRenamedEvent.SUBSCRIBER, () => this.redraw());
    }

    draw(): void {
        this.activeTab = null;
        this.setInnerHTML("");
        this.tabsElement.clear();
        for (const tab of this.tabs.values()) {
            let tabElement = HTMLUtils.createDiv("column-tab");
            let iconDiv = HTMLUtils.createDiv("column-icon");

            let fileIcon = HTMLUtils.createElement("i.fa-brands.fa-js.fileIcon");

            let closeIcon = HTMLUtils.createElement("span.closeIcon");
            closeIcon.innerHTML =
                '<svg viewBox="0 0 24 24" width="9" height="9" fill="none" aria-hidden="true">' +
                '<path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' +
                '</svg>';

            iconDiv.appendChild(fileIcon);
            iconDiv.appendChild(closeIcon);

            let titleSpan = HTMLUtils.createElement("span.tab-title");
            titleSpan.textContent = " " + tab.getTitle();

            // tabElement.appendChild(iconDiv);
            tabElement.appendChild(titleSpan);

            closeIcon.addEventListener("click", (e) => {
                e.stopPropagation(); // don't also trigger tabElement's open()
                TabsManager.getInstance().close(tab);
            });

            tabElement.addEventListener("auxclick", (e) => {
                if (e.button === 1) {
                    e.preventDefault();
                    TabsManager.getInstance().close(tab);
                }
            });

            if (tab.isActive()) {
                tabElement.classList.add("column-tab-active");
                this.activeTab = tab;
            }

            tabElement.addEventListener("click", () => {
                TabsManager.getInstance().open(tab);
            });

            tabElement.addEventListener("contextmenu", e => {
                e.preventDefault();
                ContextMenuElement.open(e.x, e.y, contextMenu => contextMenu.setGroup(EditorTabContextMenuActionGroup.INSTANCE), e);
            });

            this.addHtmlElement(tabElement);
            this.tabsElement.set(tab.getId(), tabElement);

            ContextResolver.register(tabElement, {
                provide: key => key == CommonDataKeys.SELECTED_EDITOR_TAB
                    ? tab
                    : undefined
            });
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