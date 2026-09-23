import {UIComponentMixin} from "../../engine/components/UIComponent";
import {Focusable} from "../../engine/mixins/Focusable";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {ValuedComponent} from "../../engine/mixins/ValuedComponent";
import {Describable} from "../../api/Describable";

/**
 *
 * @author Atzitz Amos
 * @date 9/12/2026
 * @since 1.0.0
 */
export class IdeSearchableList<T extends Describable> extends UIComponentMixin(Focusable, ValuedComponent<Describable>) {
    private selectedIndex: number = 0;
    private elements: T[];

    constructor(parent: HTMLElement, elements: T[]) {
        super(HTMLUtils.createDiv("ide-searchable-list", parent));

        this.elements = elements.toSorted((a, b) => a.getDescription().localeCompare(b.getDescription()));

        this.addEventListener("click", e => {
            this.focus();
            e.stopPropagation();
        });

        this.addEventListener("keydown", e => {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                this.selectedIndex = this.selectedIndex === 0 ? this.elements.length - 1 : this.selectedIndex - 1;
                this.updateSelected();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                this.selectedIndex = this.selectedIndex === this.elements.length - 1 ? 0 : this.selectedIndex + 1;
                this.updateSelected();
            } else if (e.key === "Enter") {
                e.preventDefault();
                const selectedElement = this.elements[this.selectedIndex];
                if (selectedElement) {
                    this.triggerValueConfirmed();
                }
            }
        });
    }

    getValue(): T | null {
        return this.elements[this.selectedIndex] ?? null;
    }

    public draw(): void {
        if (this.elements.length === 0) {
            this.setInnerHTML(`
                <div class="ide-searchable-list-no-results">No results</div>
            `)

            return;
        }

        this.setInnerHTML("");

        for (const element of this.elements) {
            const row = HTMLUtils.createDiv("ide-searchable-list-row");
            const icon_span = HTMLUtils.createElement("span.ide-searchable-list-row-icon", row);
            const icon = element.getIcon?.();
            if (icon) icon_span.appendChild(icon.toHTML());

            const name_span = HTMLUtils.createElement("span.ide-searchable-list-row-name", row);
            name_span.textContent = element.getDescription();
            this.addHtmlElement(row);

            row.addEventListener("click", e => {
                this.selectedIndex = this.elements.indexOf(element);
                this.updateSelected();
                e.stopPropagation();
            });

            row.addEventListener("dblclick", e => {
                this.selectedIndex = this.elements.indexOf(element);
                this.updateSelected();
                this.triggerValueConfirmed();
                e.stopPropagation();
            });
        }
        this.updateSelected();
    }

    private updateSelected() {
        const rows = this.getUnderlyingElement().querySelectorAll(".ide-searchable-list-row");
        rows.forEach((row, index) => {
            if (index === this.selectedIndex) {
                row.classList.add("selected");
                row.scrollIntoView({block: "nearest"});
            } else {
                row.classList.remove("selected");
            }
        });

        this.triggerValueChanged()
    }
}
