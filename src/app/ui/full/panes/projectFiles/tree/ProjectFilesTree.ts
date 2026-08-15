import {UIComponentMixin} from "../../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {Project} from "../../../../../../core/project/Project";
import {ActiveProjectHelper} from "../../../../../../core/global/ActiveProjectHelper";
import {Focusable} from "../../../../../../core/ui/engine/mixins/Focusable";
import {FileSystemTree} from "../../../../../../core/ui/lib/filesystem/FileSystemTree";
import {ProjectFile} from "../../../../../../core/project/filesystem/tree/ProjectFile";
import {URINavigationManager} from "../../../../../../core/uri/URINavigationManager";
import {ContextMenuElement} from "../../../../../../core/ui/lib/menu/impl/ContextMenu";
import {ProjectDirectory} from "../../../../../../core/project/filesystem/tree/ProjectDirectory";
import {Key} from "../../../../../../core/keybinds/Keybind";
import {ProjectFilesPaneHelper} from "../ProjectFilesPaneHelper";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesTree extends UIComponentMixin(Focusable) {
    private currentProject: Project | null = null;
    private filesTree: FileSystemTree;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createDiv("project-tree", root));

        this.setProject(ActiveProjectHelper.getInstance());
        ActiveProjectHelper.onFilesystemReady(this, e => {
            this.setProject(ActiveProjectHelper.getInstance());
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

        if (!this.currentProject || !this.currentProject.getFS()) {
            this.setInnerHTML(`
                <div class="empty-state">
                    <i class="fa-solid fa-folder-open empty-icon"></i>
                    <span class="empty-text">No project opened</span>
                </div>
            `);
        } else {
            this.setInnerHTML(``);

            this.filesTree = new FileSystemTree(this.getUnderlyingElement(), this.currentProject.getFS().getRoot());
            this.filesTree.setFileOpenedHandler(file => this.openFile(file));
            this.filesTree.setEntrySelectedHandler(entry => ProjectFilesPaneHelper.setSelected(entry))
            this.filesTree.setContextMenu((data, contextMenu) => {
                if (data.isFile()) this.setupFileContextMenu(data as ProjectFile, contextMenu);
                else this.setupDirContextMenu(data as ProjectDirectory, contextMenu);
            })

            this.addChild(this.filesTree);
            this.drawChildren();
        }
    }

    private setProject(project: Project | null) {
        if (project && !project.getFS()) {
            this.currentProject = null;
            return;
        }
        if (this.currentProject === project && (this.currentProject && this.currentProject.getFS())) {
            return;
        }
        this.currentProject = project;
        this.redraw();
    }

    private openFile(file: ProjectFile) {
        URINavigationManager.navigateAsync(file.getURI());
    }

    private setupFileContextMenu(data: ProjectFile, contextMenu: ContextMenuElement) {
        contextMenu.addAction("Open", () => {
            this.openFile(data);
        }, null, {key: Key.ENTER});
    }

    private setupDirContextMenu(directory: ProjectDirectory, contextMenu: ContextMenuElement) {

    }
}
