import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {Workspace} from "../../../../../core/workspace/Workspace";
import {CurrentWorkspaceHelper} from "../../../../../core/global/CurrentWorkspaceHelper";
import {ProjectFilesTreeDirectory} from "./ProjectFilesTreeDirectory";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesTree extends UIComponent {
    private currentWorkspace: Workspace | null = null;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("project-tree", root));

        this.setWorkspace(CurrentWorkspaceHelper.getInstance());
        CurrentWorkspaceHelper.onFilesystemReady(this, e => {
            this.setWorkspace(CurrentWorkspaceHelper.getInstance());
        });
    }

    public draw(): void {
        // this.setInnerHTML(`
        //     <div class="tree-item depth-0 expanded">
        //     <div class="tree-item-header">
        //       <i class="fa-solid fa-chevron-down tree-caret"></i>
        //       <i class="fa-regular fa-folder-open tree-icon folder"></i>
        //       <span class="tree-name">src</span>
        //       </div>
        //       <div class="tree-item-children">
        //           <div class="tree-item expanded">
        //               <div class="tree-item-header"
        //               ><i class="fa-solid fa-chevron-down tree-caret"></i>
        //               <i class="fa-regular fa-folder-open tree-icon folder"></i>
        //               <span class="tree-name">app</span></div>
        //           </div>
        //       </div>
        //     </div>
        //
        //     <div class="tree-item depth-2">
        //       <i class="fa-solid fa-file-lines tree-icon file"></i>
        //       <span class="tree-name">ShadowUI.ts</span>
        //       <span class="tree-state state-modified">M</span>
        //     </div>
        //     <div class="tree-item depth-1">
        //       <i class="fa-solid fa-file-lines tree-icon file"></i>
        //       <span class="tree-name">index.ts</span>
        //     </div>
        //     <div class="tree-item depth-0 expanded">
        //       <i class="fa-solid fa-chevron-down tree-caret"></i>
        //       <i class="fa-regular fa-folder-open tree-icon folder"></i>
        //       <span class="tree-name">tests</span>
        //     </div>
        //     <div class="tree-item depth-1">
        //       <i class="fa-solid fa-file-lines tree-icon file"></i>
        //       <span class="tree-name">timeline.spec.ts</span>
        //     </div>
        //     <div class="tree-item depth-0">
        //       <i class="fa-solid fa-file-lines tree-icon file"></i>
        //       <span class="tree-name">README.md</span>
        //     </div>
        // `);

        if (!this.currentWorkspace || !this.currentWorkspace.getFS()) {
            this.setInnerHTML(`
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open empty-icon"></i>
                    <span class="empty-text">No project opened</span>
                </div>
            `);
        } else {
            this.setInnerHTML(``);

            let directory = new ProjectFilesTreeDirectory(this.getUnderlyingElement(), this.currentWorkspace.getFS().getRoot(), 0);
            directory.load();

            this.addChild(directory);
            this.drawChildren();
        }
    }

    private setWorkspace(workspace: Workspace | null) {
        if (workspace && !workspace.getFS()) {
            this.currentWorkspace = null;
            return;
        }
        if (this.currentWorkspace === workspace && (this.currentWorkspace && this.currentWorkspace.getFS())) {
            return;
        }
        this.currentWorkspace = workspace;
        this.redraw();
    }
}
