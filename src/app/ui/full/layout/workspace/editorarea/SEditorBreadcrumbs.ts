import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {ActiveProjectHelper} from "../../../../../../core/global/ActiveProjectHelper";
import {ProjectFilesPaneHelper} from "../../../panes/projectFiles/ProjectFilesPaneHelper";
import {FileSystemEntry} from "../../../../../../core/project/filesystem/tree/FileSystemEntry";
import {TabsManager} from "../../../../../core/tabs/TabsManager";
import {UIHooks} from "../../../../../../core/ui/engine/listeners/hooks/UIHooks";
import {ProjectHooks, TabHooks, UICommonHooks} from "../../../../../core/UICommonHooks";
import {EditorTab} from "../../../../../core/tabs/EditorTab";
import {GlobalState} from "../../../../../../core/global/GlobalState";
import {FileSystemEvent} from "../../../../../../core/project/events/FileSystemEvent";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
@UIHooks.redrawOn(ProjectHooks.PROJECT_CHANGED,
    ProjectHooks.PROJECT_FILES_SELECTED_CHANGED,
    TabHooks.TAB_ACTIVE,
    TabHooks.TAB_HIDE)
export class SEditorBreadcrumbs extends UIComponent {

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-breadcrumbs", root));

        GlobalState.getMainEventBus().subscribe(this, FileSystemEvent.SUBSCRIBER, () => this.redraw());
    }

    draw(): void {
        this.setInnerHTML(``);

        const project = ActiveProjectHelper.getInstance();
        if (!project) return;

        let activeTab = TabsManager.getInstance().getActiveTab();
        if (!activeTab || !(activeTab instanceof EditorTab)) return;
        let entry: FileSystemEntry | undefined | null = activeTab.getDocument().getAssociatedFile();
        if (!entry) return;

        let active = true;
        if (ProjectFilesPaneHelper.hasFocus()) {
            entry = ProjectFilesPaneHelper.getSelectedTreeEntry();
            if (!entry) return;
            active = false;
        }

        const path = entry.getPath().getSegments();
        let html = `<span>${path[0]}</span>`;

        for (let i = 1; i < path.length; i++) {
            html += `<span class="crumb-sep">/</span>`;
            html += `<span class="${(i == path.length - 1 && active) ? 'crumb-active' : ''}">${path[i]}</span>`;
        }

        this.setInnerHTML(html);
    }

    @UIHooks.react(UICommonHooks.FOCUS_CHANGE)
    onFocusChange(old: HTMLElement, new_: HTMLElement) {
        const root = GlobalState.getMainEditor()?.getView().getRootElement();
        if (root && root.contains(new_)) {
            this.redraw();
        }
    }
}
