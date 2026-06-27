import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {ActiveWorkspaceHelper} from "../../../../../../core/global/ActiveWorkspaceHelper";
import {ProjectFilesPaneHelper} from "../../../panes/projectFiles/ProjectFilesPaneHelper";
import {FSNodeEntry} from "../../../../../../core/workspace/filesystem/tree/FSNodeEntry";
import {TabsManager} from "../../../../../core/tabs/TabsManager";
import {UIHooks} from "../../../../../../core/ui/engine/listeners/hooks/UIHooks";
import {TabHooks, UICommonHooks, WorkspaceHooks} from "../../../../../core/UICommonHooks";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
@UIHooks.redrawOn(UICommonHooks.FOCUS_CHANGE,
    WorkspaceHooks.WORKSPACE_CHANGED,
    WorkspaceHooks.PROJECT_FILES_SELECTED_CHANGED,
    TabHooks.TAB_ACTIVE)
export class SEditorBreadcrumbs extends UIComponent {

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("column-breadcrumbs", root));
    }

    draw(): void {
        this.setInnerHTML(``);

        const workspace = ActiveWorkspaceHelper.getInstance();
        if (!workspace) return;

        let entry: FSNodeEntry | undefined | null = TabsManager.getInstance().getActiveTab()?.getDocument().getAssociatedFile();
        let active = true;
        if (!entry) return;
        if (ProjectFilesPaneHelper.hasFocus()) {
            const tree = ProjectFilesPaneHelper.getSelectedTreeEntry();
            if (!tree) return;
            entry = tree.getEntry();
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
}
