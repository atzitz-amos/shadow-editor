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
import {KeybindManager} from "../../../../../../core/keybinds/KeybindManager";
import {NewEntryChooseTypeDialog} from "../dialog/NewEntryChooseTypeDialog";
import {IdeDialogUtilsCore} from "../../../../../../core/ui/lib/dialog/utils/IdeDialogUtilsCore";
import {FileSystemEntry} from "../../../../../../core/project/filesystem/tree/FileSystemEntry";
import {CommonDataKeys} from "../../../../../../core/keybinds/context/data/CommonDataKeys";
import {ProjectFilesContextMenuActionGroup} from "../actions/ProjectFilesContextMenuActionGroup";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesTree extends UIComponentMixin(Focusable) {
    private static readonly NEW_ACTION_SHORTCUT = {key: Key.INSERT, alt: true};
    private static readonly DELETE_ACTION_SHORTCUT = {key: Key.DELETE};

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
            this.filesTree.setKeydownHandler((event, entry) => {
                if (KeybindManager.eventMatchesKeybind(ProjectFilesTree.NEW_ACTION_SHORTCUT, event)) {
                    if (!(entry instanceof ProjectDirectory)) {
                        entry = entry.getParent()!;
                    }
                    this.handleNew(entry as ProjectDirectory);
                } else if (KeybindManager.eventMatchesKeybind(ProjectFilesTree.DELETE_ACTION_SHORTCUT, event)) {
                    this.deleteEntry(entry);
                }
            });
            this.filesTree.setContextMenu((contextMenu) => {
                contextMenu.setGroup(ProjectFilesContextMenuActionGroup.INSTANCE);
            });

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
        contextMenu.addAction("Open", context => {
            this.openFile(context?.require(CommonDataKeys.PROJECT_FILE) ?? data);
        }, null, {key: Key.ENTER});

        contextMenu.addAction("New", context => {
            const file = context?.get(CommonDataKeys.PROJECT_FILE) ?? data;
            this.handleNew(file.getParent());
        }, null, ProjectFilesTree.NEW_ACTION_SHORTCUT);

        contextMenu.addAction("Delete", context => {
            this.deleteEntry(context?.get(CommonDataKeys.PROJECT_FILE) ?? data);
        }, null, {key: Key.DELETE});
    }

    private setupDirContextMenu(directory: ProjectDirectory, contextMenu: ContextMenuElement) {
        contextMenu.setGroup(ProjectFilesContextMenuActionGroup.INSTANCE);

        // contextMenu.addAction("Delete", () => {
        //     this.deleteEntry(directory);
        // }, null, ProjectFilesTree.DELETE_ACTION_SHORTCUT);
    }

    private async handleNew(entry: ProjectDirectory) {
        const result = await IdeDialogUtilsCore.awaitDialog(new NewEntryChooseTypeDialog());
        if (!result) return;

        const name = await IdeDialogUtilsCore.askString("Enter name", "Name");
        if (!name) return;

        const child = result.createEntry(entry, name);

        if (!this.filesTree.isExpanded(entry)) {
            this.filesTree.setExpanded(entry);
        }

        setTimeout(() => this.filesTree.select(child));
    }

    private async deleteEntry(entry: FileSystemEntry) {
        if (!await IdeDialogUtilsCore.confirm("Delete", "Are you sure you want to delete: " + entry.getName() + "?")) return;

        entry.delete();
    }
}
