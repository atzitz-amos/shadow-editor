import {UIComponent} from "../../engine/components/UIComponent";
import {UIComponentElement} from "../elements/UIComponentElement";
import {ElementComponent} from "../elements/ElementComponent";
import {CustomElementsRegistry} from "../CustomElementsRegistry";

export interface TabItem {
    id: string;
    label: string;
    content: UIComponent;
    tooltip?: string;
    tooltipPosition?: "top" | "bottom" | "left" | "right";
}

export class TabPane extends UIComponent {
    private tabs: TabItem[] = [];
    private activeTabId: string | null = null;
    private readonly selectionListeners: ((id: string) => void)[] = [];

    private readonly tabNavElement: HTMLElement;
    private readonly tabContentElement: HTMLElement;

    public constructor() {
        const element = document.createElement("div");
        element.classList.add("tab-pane-container");
        super(element);

        this.tabNavElement = document.createElement("div");
        this.tabNavElement.classList.add("tab-nav");

        this.tabContentElement = document.createElement("div");
        this.tabContentElement.classList.add("tab-content-wrapper");

        this.addHtmlElement(this.tabNavElement);
        this.addHtmlElement(this.tabContentElement);
    }

    public addTab(id: string, label: string, content: UIComponent, tooltip?: string, tooltipPosition: "top" | "bottom" | "left" | "right" = "bottom"): void {
        const tabItem: TabItem = {id, label, content, tooltip, tooltipPosition};
        this.tabs.push(tabItem);

        this.addChildTo(content, this.tabContentElement);

        if (this.activeTabId === null) {
            this.activeTabId = id;
        }

        this.renderTabsNav();
        this.updateTabVisibility();
    }

    public selectTab(id: string): void {
        if (this.activeTabId === id) return;

        const tabExists = this.tabs.some(tab => tab.id === id);
        if (!tabExists) return;

        this.activeTabId = id;
        this.renderTabsNav();
        this.updateTabVisibility();

        for (const listener of this.selectionListeners) {
            listener(id);
        }
    }

    public getSelectedTabId(): string | null {
        return this.activeTabId;
    }

    /** Called whenever another tab gets selected, by the user or by {@link selectTab} */
    public onTabSelected(listener: (id: string) => void): void {
        this.selectionListeners.push(listener);
    }

    public draw(): void {
        this.renderTabsNav();
        this.updateTabVisibility();
    }

    private renderTabsNav(): void {
        this.tabNavElement.innerHTML = "";

        for (const tab of this.tabs) {
            const tabButton = document.createElement("button");
            tabButton.classList.add("tab-button");
            tabButton.innerText = tab.label;

            if (tab.tooltip) {
                tabButton.classList.add("show-tooltip");
                tabButton.setAttribute("data-tooltip", tab.tooltip);
                tabButton.setAttribute("data-tooltip-position", tab.tooltipPosition ?? "bottom");
            }

            if (tab.id === this.activeTabId) {
                tabButton.classList.add("active");
            }

            tabButton.addEventListener("click", () => {
                this.selectTab(tab.id);
            });

            this.tabNavElement.appendChild(tabButton);
        }
        this.drawChildren();
    }

    private updateTabVisibility(): void {
        for (const tab of this.tabs) {
            const isCurrent = tab.id === this.activeTabId;
            const element = tab.content.getUnderlyingElement();

            if (isCurrent) {
                element.style.display = "";
                tab.content.drawAsRoot();
            } else {
                element.style.display = "none";
            }
        }
    }
}

/**
 * {@code <ide-tabs selected="b">}: a {@link TabPane} with one tab per {@code <ide-tab>} child, such as
 * {@code <ide-tab tab-id="b" label="Second" tooltip="..." tooltip-position="top">content</ide-tab>}.
 * <p>
 * Tabs without {@code tab-id} are identified by their position. Tabs appended later are added to the pane.
 * The {@code selected} attribute follows the selected tab, and a {@code change} event is dispatched on selection.
 */
class _CustomIdeTabs extends UIComponentElement<TabPane> {
    private readonly observer = new MutationObserver(() => this.adoptTabs());
    private tabCount = 0;

    static get observedAttributes() {
        return ["selected"];
    }

    get selected(): string | null {
        return this.getComponent()?.getSelectedTabId() ?? this.getAttribute("selected");
    }

    set selected(id: string) {
        this.setAttribute("selected", id);
    }

    connectedCallback() {
        super.connectedCallback();
        this.observer.observe(this, {childList: true});
    }

    disconnectedCallback() {
        this.observer.disconnect();
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        if (newValue !== null) this.getComponent()?.selectTab(newValue);
    }

    protected rebuild() {
        super.rebuild();
        this.adoptTabs();
    }

    protected createComponent(): TabPane {
        const pane = new TabPane();
        pane.onTabSelected(id => {
            if (this.getAttribute("selected") !== id) this.setAttribute("selected", id);
            this.dispatchEvent(new CustomEvent("change", {detail: {id}}));
        });
        return pane;
    }

    /** Moves the {@code <ide-tab>} children into the pane */
    private adoptTabs() {
        const pane = this.getComponent();
        if (pane === null) return;

        for (const tab of this.querySelectorAll<HTMLElement>(":scope > ide-tab")) {
            const id = tab.getAttribute("tab-id") ?? String(this.tabCount);
            this.tabCount++;

            const position = tab.getAttribute("tooltip-position") as TabItem["tooltipPosition"] | null;
            pane.addTab(id, tab.getAttribute("label") ?? id, new ElementComponent(tab), tab.getAttribute("tooltip") ?? undefined, position ?? undefined);
        }

        const selected = this.getAttribute("selected");
        if (selected !== null) pane.selectTab(selected);
    }
}

CustomElementsRegistry.register("ide-tabs", _CustomIdeTabs);
