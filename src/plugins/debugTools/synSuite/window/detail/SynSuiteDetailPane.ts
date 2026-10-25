import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {SynSuiteWindowContext} from "../SynSuiteWindowContext";
import {SynSuiteTestDetail} from "./SynSuiteTestDetail";
import {SynSuiteGroupDetail} from "./SynSuiteGroupDetail";
import {SynSuiteDetailTab, SynSuiteDetailTabs} from "./SynSuiteDetailTab";
import {SynSuiteCodeTab} from "./tabs/SynSuiteCodeTab";
import {SynSuiteTreeTab} from "./tabs/SynSuiteTreeTab";
import {SynSuiteInspectionsTab} from "./tabs/SynSuiteInspectionsTab";
import {SynSuiteTimingsTab} from "./tabs/SynSuiteTimingsTab";

/** Tabs of the test detail, in display order */
const TEST_TABS: SynSuiteDetailTab[] = [
    new SynSuiteCodeTab(),
    new SynSuiteTreeTab(),
    new SynSuiteInspectionsTab(),
    new SynSuiteTimingsTab()
];

/**
 * Right side of the window: the detail of the selected test or group.
 *
 * @author Atzitz Amos
 * @date 10/23/2026
 * @since 1.0.0
 */
export class SynSuiteDetailPane extends UIComponent {
    private readonly testDetail: SynSuiteTestDetail;
    private readonly groupDetail: SynSuiteGroupDetail;
    private readonly empty: HTMLElement;

    constructor(private readonly context: SynSuiteWindowContext) {
        super(HTMLUtils.createDiv("syn-suite-detail-pane"));

        this.testDetail = new SynSuiteTestDetail(context, TEST_TABS);
        this.groupDetail = new SynSuiteGroupDetail(context);
        this.addChild(this.testDetail);
        this.addChild(this.groupDetail);

        this.empty = HTMLUtils.createDiv("syn-suite-detail", this.getUnderlyingElement());
        SynSuiteDetailTabs.emptyState(this.empty, "fa-solid fa-flask", "Select a test or a group");
    }

    draw(): void {
        const selection = this.context.state.getSelection();
        const test = selection?.kind === "test" ? this.context.store.get(selection.id) : null;
        const group = selection?.kind === "group" && this.context.store.hasGroup(selection.path) ? selection.path : null;

        this.toggle(this.testDetail.getUnderlyingElement(), test !== null);
        this.toggle(this.groupDetail.getUnderlyingElement(), group !== null);
        this.toggle(this.empty, test === null && group === null);

        if (test) this.testDetail.show(test);
        else if (group !== null) this.groupDetail.show(group);
    }

    private toggle(element: HTMLElement, visible: boolean) {
        element.style.display = visible ? "" : "none";
    }
}
