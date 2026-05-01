import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {NodeEntry} from "../../../../../core/workspace/filesystem/tree/NodeEntry";
import {ProjectFilesTreeItem} from "./ProjectFilesTreeItem";
import {WorkspaceDirectory} from "../../../../../core/workspace/filesystem/tree/WorkspaceDirectory";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesTreeDirectory extends UIComponent {
    isLoaded: boolean = false;
    private readonly depth: number;
    private readonly directory: WorkspaceDirectory;
    private entries: NodeEntry[] = [];
    private isExpanded: boolean = true;

    constructor(root: HTMLElement, directory: WorkspaceDirectory, depth: number) {
        super(HTMLUtils.createDiv(`tree-item`, root));
        this.depth = depth;
        this.directory = directory;
    }

    public setExpanded(expanded: boolean) {
        if (this.isExpanded !== expanded) {
            this.isExpanded = expanded;
            this.updateExpanded();

        }
    }

    public setSelected() {
        document.querySelector(".tree-item-file-header.selected, .tree-item-header.selected")?.classList.remove("selected");
        this.getUnderlyingElement().querySelector(".tree-item-header")?.classList.add("selected");
    }

    public setEntries(entries: NodeEntry[]) {
        this.entries = entries;
        this.entries.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) {
                return -1;
            } else if (!a.isDirectory() && b.isDirectory()) {
                return 1;
            } else {
                return a.getName().localeCompare(b.getName());
            }
        });
    }

    public async load() {
        this.setEntries(await this.directory.getChildren());
        this.isLoaded = true;
        this.redraw();
    }

    public draw(): void {
        if (!this.isLoaded) {
            this.setInnerHTML(`
                <div class="tree-loading">
                   Loading...
                </div>
            `);
            return;
        }
        this.setInnerHTML(`
            <div class="tree-item-header">
              <span class="tree-caret">
                <i class="fa-solid fa-chevron-down"></i>
              </span>
              <i class="fa-regular fa-folder-open tree-icon folder"></i>
              <span class="tree-name">${this.directory.getName()}</span>
            </div>
            <div class="tree-item-children">  
            </div>
        `);

        const childrenContainer = this.getUnderlyingElement().querySelector(".tree-item-children") as HTMLElement;
        for (const entry of this.entries) {
            if (entry.isDirectory()) {
                let directory = new ProjectFilesTreeDirectory(childrenContainer, entry, this.depth + 1);
                directory.load();
                this.addChild(directory);
            } else if (entry.isFile()) {
                this.addChild(new ProjectFilesTreeItem(childrenContainer, entry.getPath(), entry.getURI(), this.depth + 1));
            }
        }

        const caret = this.getUnderlyingElement().querySelector(".tree-caret") as HTMLElement;
        caret.addEventListener("click", () => {
            this.setExpanded(!this.isExpanded);
        });

        const header = this.getUnderlyingElement().querySelector(".tree-item-header") as HTMLElement;
        header.addEventListener("click", () => {
            this.setSelected();
        });

        header.addEventListener("dblclick", () => {
            this.setExpanded(!this.isExpanded);
        });

        this.drawChildren();
        this.updateExpanded();
    }

    private updateExpanded() {
        if (!this.isExpanded) {
            this.getUnderlyingElement().classList.remove("expanded");
        } else {
            this.getUnderlyingElement().classList.add("expanded");
        }
    }
}
