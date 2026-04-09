import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";

export class TaskbarSearchBar extends UIComponent {
    private readonly iconElement: HTMLElement;
    private readonly inputElement: HTMLInputElement;
    private readonly ctrlKeyElement: HTMLElement;
    private readonly kKeyElement: HTMLElement;

    constructor(root: HTMLElement) {
        let parentElement = HTMLUtils.createDiv("topbar-middle", root);
        super(HTMLUtils.createDiv("topbar-search", parentElement));

        this.iconElement = HTMLUtils.createElement("i.fa-solid.fa-magnifying-glass");
        this.inputElement = HTMLUtils.createElement("input.search-input") as HTMLInputElement;
        this.inputElement.placeholder = "Search files, symbols or tasks";

        // Visible keybind hint chips to mirror the static mock (Ctrl + K)
        this.ctrlKeyElement = HTMLUtils.createElement("span.kbd");
        this.ctrlKeyElement.textContent = "Ctrl";

        this.kKeyElement = HTMLUtils.createElement("span.kbd");
        this.kKeyElement.textContent = "K";
    }

    draw(): void {
        this.addHtmlElement(this.iconElement);
        this.addHtmlElement(this.inputElement);
        this.addHtmlElement(this.ctrlKeyElement);
        this.addHtmlElement(this.kKeyElement);
    }
}