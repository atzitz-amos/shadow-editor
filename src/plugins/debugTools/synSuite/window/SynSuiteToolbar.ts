import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {IdeMenuButton} from "../../../../core/ui/lib/buttons/IdeMenuButton";
import {FaIcon} from "../../../../core/ui/icons/FaIcon";
import {UIVariant} from "../../../../core/ui/lib/theme/UIVariant";
import {SynSuiteWindowContext} from "./SynSuiteWindowContext";
import {SynSuiteFilter} from "./SynSuiteWindowState";
import {SynSuiteStatus} from "./SynSuiteStatus";
import {SynSuiteTest} from "../../../../app/testLib/lang/suite/SynSuiteTest";

const FILTERS: { filter: SynSuiteFilter, label: string }[] = [
    {filter: "all", label: "All"},
    {filter: "failing", label: "Failing"},
    {filter: "passed", label: "Passed"},
    {filter: "idle", label: "Not run"}
];

/**
 * Run button, status filter and path search.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteToolbar extends UIComponent {
    private readonly runButton: IdeMenuButton;
    private readonly filters: HTMLElement;

    constructor(private readonly context: SynSuiteWindowContext) {
        super(HTMLUtils.createDiv("syn-suite-toolbar"));
        const root = this.getUnderlyingElement();

        this.runButton = new IdeMenuButton(menu => {
            const selection = context.state.getSelection();
            menu.addAction("Run failing", () => this.run(context.store.getAll().filter(t => SynSuiteStatus.isFailing(context.statusOf(t)))),
                FaIcon.solid("rotate-right"));
            menu.addAction("Run visible", () => this.run(context.getVisibleTests()), FaIcon.solid("filter"));
            if (selection?.kind === "group") {
                menu.addAction(`Run ${selection.path || "all"}`, () => this.run(context.getTestsIn(selection.path)), FaIcon.regular("folder"));
            }
        }, {
            label: "Run all",
            icon: FaIcon.solid("play"),
            variant: UIVariant.PRIMARY,
            placement: "bottom-start",
            primaryAction: () => this.run(context.store.getAll())
        });
        this.addChildTo(this.runButton, root);

        this.filters = HTMLUtils.createDiv("syn-suite-segmented", root);
        for (const {filter, label} of FILTERS) {
            const button = HTMLUtils.createElement<HTMLButtonElement>("button.syn-suite-segment", this.filters);
            button.type = "button";
            button.dataset.filter = filter;
            button.textContent = label;
            button.addEventListener("click", () => context.state.setFilter(filter));
        }

        const search = HTMLUtils.createElement<HTMLLabelElement>("label.syn-suite-search", root);
        search.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i><input type="text" placeholder="Filter by path…" spellcheck="false">`;
        const input = search.querySelector("input")!;
        input.addEventListener("input", () => context.state.setSearch(input.value));
        input.addEventListener("keydown", e => {
            // Escape clears the search instead of closing the window
            if (e.key === "Escape" && input.value !== "") {
                e.stopPropagation();
                input.value = "";
                context.state.setSearch("");
            }
        });
    }

    draw(): void {
        this.runButton.draw();
        this.update();
    }

    /** Reflects the filter, and disables running while a run is in progress */
    update(): void {
        this.runButton.setEnabled(!this.context.runner.isRunning());

        const filter = this.context.state.getFilter();
        this.filters.querySelectorAll<HTMLElement>(".syn-suite-segment")
            .forEach(button => button.classList.toggle("active", button.dataset.filter === filter));
    }

    private run(tests: SynSuiteTest[]) {
        void this.context.runner.run(tests);
    }
}
