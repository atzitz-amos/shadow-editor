import {UIComponentMixin} from "../../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {Workspace} from "../../../../../../core/workspace/Workspace";
import {ActiveWorkspaceHelper} from "../../../../../../core/global/ActiveWorkspaceHelper";
import {ProjectFilesTreeDirectory} from "./ProjectFilesTreeDirectory";
import {FileCreatedEvent} from "../../../../../../core/workspace/events/FileCreatedEvent";
import {DirectoryCreatedEvent} from "../../../../../../core/workspace/events/DirectoryCreatedEvent";
import {FileDeletedEvent} from "../../../../../../core/workspace/events/FileDeletedEvent";
import {DirectoryDeletedEvent} from "../../../../../../core/workspace/events/DirectoryDeletedEvent";
import {FileRenamedEvent} from "../../../../../../core/workspace/events/FileRenamedEvent";
import {DirectoryRenamedEvent} from "../../../../../../core/workspace/events/DirectoryRenamedEvent";
import {Focusable} from "../../../../../../core/ui/engine/mixins/Focusable";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesTree extends UIComponentMixin(Focusable) {
    private currentWorkspace: Workspace | null = null;
    private directory: ProjectFilesTreeDirectory;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("project-tree", root));

        this.setWorkspace(ActiveWorkspaceHelper.getInstance());
        ActiveWorkspaceHelper.onFilesystemReady(this, e => {
            this.setWorkspace(ActiveWorkspaceHelper.getInstance());
        });

        ActiveWorkspaceHelper.onWorkspaceChanges(
            this,
            this.createHandler,
            this.deleteHandler,
            this.renameHandler);
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

            this.directory = new ProjectFilesTreeDirectory(this.getUnderlyingElement(), this.currentWorkspace.getFS().getRoot(), 0);
            this.directory.load();

            this.addChild(this.directory);
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

    private createHandler(ev: FileCreatedEvent | DirectoryCreatedEvent) {
        const entry = ev.getEntry();
        const child = this.directory.recursivelyFind(entry.getParent()!);

        if (!(child instanceof ProjectFilesTreeDirectory)) {
            console.warn("Could not find parent for entry", entry);
            return;
        }

        child.addEntry(entry);
    }

    private deleteHandler(ev: FileDeletedEvent | DirectoryDeletedEvent) {
        const entry = ev.getEntry();
        const child = this.directory.recursivelyFind(entry.getParent()!);

        if (!(child instanceof ProjectFilesTreeDirectory)) {
            console.warn("Could not find parent for entry", entry);
            return;
        }

        child?.deleteEntry(entry);
    }

    private renameHandler(ev: FileRenamedEvent | DirectoryRenamedEvent) {
        const entry = ev.getEntry();
        const child = this.directory.recursivelyFind(entry);

        console.log(child);

        child?.rename(ev.getNewName());
    }
}
