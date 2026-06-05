import {UIComponent} from "../../engine/components/UIComponent";

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
                tab.content.draw();
                (tab.content as any).wasDrawn = true;
            } else {
                element.style.display = "none";
            }
        }
    }
}