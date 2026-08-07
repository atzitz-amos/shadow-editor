import {UIComponent} from "../../engine/components/UIComponent";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {FaIcon} from "../../icons/FaIcon";

interface NavRecord {
    title: string;
    component: UIComponent;
    wrapper: HTMLElement;
}

export class NavPaneContainer extends UIComponent {
    private readonly headerElement: HTMLElement;
    private readonly backButton: HTMLElement;
    private readonly titleElement: HTMLElement;
    private readonly viewportElement: HTMLElement;
    private readonly historyStack: NavRecord[] = [];

    public constructor(root: HTMLElement) {
        super(HTMLUtils.createElement<HTMLDivElement>("div.ui-nav-pane-container", root));

        // Create the navigation top header bar layout (No longer hides completely)
        this.headerElement = HTMLUtils.createElement<HTMLDivElement>("div.ui-nav-pane-header", this.getUnderlyingElement());

        // Setup back trigger button
        this.backButton = HTMLUtils.createElement<HTMLButtonElement>("button.icon-button.subtle", this.headerElement);
        this.backButton.setAttribute("aria-label", "Go back");
        this.backButton.style.translate = "0 1px";
        this.backButton.appendChild(FaIcon.solid("fa-arrow-left").toHTML());


        this.titleElement = HTMLUtils.createElement<HTMLSpanElement>("span.ui-nav-pane-title", this.headerElement);
        this.viewportElement = HTMLUtils.createElement<HTMLDivElement>("div.ui-nav-pane-viewport", this.getUnderlyingElement());

        this.backButton.addEventListener("click", () => this.popPane());
    }

    public setRootPane(title: string, component: UIComponent): void {
        this.clearChildren();
        this.historyStack.length = 0;
        this.pushPane(title, component);
    }

    public pushPane(title: string, component: UIComponent): void {
        if (this.historyStack.length > 0) {
            const currentTop = this.historyStack[this.historyStack.length - 1];
            currentTop.wrapper.classList.remove("is-active");
            currentTop.wrapper.classList.add("is-historic");
        }

        const wrapper = HTMLUtils.createElement<HTMLDivElement>("div.ui-nav-pane-item", this.viewportElement);
        this.addChildTo(component, wrapper);

        component.draw();

        const record: NavRecord = {title, component, wrapper};
        this.historyStack.push(record);

        requestAnimationFrame(() => {
            wrapper.classList.add("is-active");
            this.updateHeaderUI();
        });
    }

    public popPane(): void {
        if (this.historyStack.length <= 1) return;

        const deadRecord = this.historyStack.pop()!;
        deadRecord.wrapper.classList.remove("is-active");

        const targetRecord = this.historyStack[this.historyStack.length - 1];
        targetRecord.wrapper.classList.remove("is-historic");
        targetRecord.wrapper.classList.add("is-active");

        this.updateHeaderUI();

        setTimeout(() => {
            this.removeChild(deadRecord.component);
            if (deadRecord.wrapper.parentElement) {
                deadRecord.wrapper.parentElement.removeChild(deadRecord.wrapper);
            }
        }, 200);
    }

    public draw(): void {
        this.drawChildren();
    }

    private updateHeaderUI(): void {
        const depth = this.historyStack.length;

        if (depth <= 1) {
            // Root state: remove class to animate padding back to 0 and slide button away
            this.headerElement.classList.remove("has-back-button");
        } else {
            // Child state: add class to animate padding inward and slide button into view
            this.headerElement.classList.add("has-back-button");
        }

        // Smoothly update title string matching active layer index metadata
        this.titleElement.innerText = this.historyStack[depth - 1]?.title ?? "";
    }
}