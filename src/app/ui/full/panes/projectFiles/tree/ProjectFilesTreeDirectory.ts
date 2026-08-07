import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {FSNodeEntry} from "../../../../../../core/workspace/filesystem/tree/FSNodeEntry";
import {ProjectFilesTreeItem} from "./ProjectFilesTreeItem";
import {WorkspaceDirectory} from "../../../../../../core/workspace/filesystem/tree/WorkspaceDirectory";
import {ProjectFilesTreeNode} from "./ProjectFilesTreeNode";
import {ProjectFilesPaneHelper} from "../ProjectFilesPaneHelper";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesTreeDirectory extends UIComponent implements ProjectFilesTreeNode {
    isLoaded: boolean = false;
    private readonly depth: number;

    private readonly directory: WorkspaceDirectory;
    private readonly sortedChildren: (ProjectFilesTreeNode & UIComponent)[] = [];

    private entries: FSNodeEntry[] = [];
    private isExpanded: boolean = true;

    constructor(root: HTMLElement, directory: WorkspaceDirectory, depth: number) {
        super(HTMLUtils.createDiv(`tree-item`, root));
        this.depth = depth;
        this.directory = directory;
    }

    getEntry(): FSNodeEntry {
        return this.directory;
    }

    getDepth(): number {
        return this.depth;
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

        this.getHeaderElement().focus();

        ProjectFilesPaneHelper.setSelected(this);
    }

    public setEntries(entries: FSNodeEntry[]) {
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

        this.sortedChildren.length = 0;

        const childrenContainer = this.getUnderlyingElement().querySelector(".tree-item-children") as HTMLElement;
        for (const entry of this.entries) {
            const child = this.createEntryChild(entry, childrenContainer);
            this.sortedChildren.push(child);
            this.addChild(child);
        }

        const caret = this.getUnderlyingElement().querySelector(".tree-caret") as HTMLElement;
        caret.addEventListener("click", () => {
            this.setExpanded(!this.isExpanded);
        });

        const header = this.getHeaderElement();
        header.addEventListener("click", () => {
            this.setSelected();
        });

        header.addEventListener("dblclick", () => {
            this.setExpanded(!this.isExpanded);
        });

        header.setAttribute("tabindex", "-1");

        this.drawChildren();
        this.updateExpanded();
    }

    recursivelyFind(entry: FSNodeEntry): ProjectFilesTreeNode | null {
        if (entry === this.directory) return this;
        for (let child of this.sortedChildren) {
            if (child.getEntry() === entry)
                return child;
            else if (child instanceof ProjectFilesTreeDirectory) {
                const result = child.recursivelyFind(entry);
                if (result) return result;
            }
        }
        return null;
    }

    addEntry(entry: FSNodeEntry) {
        this.entries.push(entry);
        this.entries.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) {
                return -1;
            } else if (!a.isDirectory() && b.isDirectory()) {
                return 1;
            } else {
                return a.getName().localeCompare(b.getName());
            }
        });

        const index = this.entries.indexOf(entry);

        const childrenContainer = this.getUnderlyingElement().querySelector(".tree-item-children") as HTMLElement;
        const child = this.createEntryChild(entry, childrenContainer);

        this.addChildAfter(child, this.sortedChildren[index].getUnderlyingElement());
        this.sortedChildren.splice(index, 0, child);
    }

    deleteEntry(entry: FSNodeEntry) {
        this.entries.splice(this.entries.indexOf(entry), 1);
        const child = this.sortedChildren.find(c => c.getEntry() === entry);
        if (child) {
            this.removeChild(child);
            this.sortedChildren.splice(this.sortedChildren.indexOf(child), 1);
        }
    }

    rename(newName: string) {
        this.getUnderlyingElement().querySelector(".tree-name")!.textContent = newName;
    }

    private getHeaderElement() {
        return this.getUnderlyingElement().querySelector(".tree-item-header") as HTMLElement;
    }

    private createEntryChild(entry: FSNodeEntry, childrenContainer: HTMLElement) {
        if (entry.isDirectory()) {
            let directory = new ProjectFilesTreeDirectory(childrenContainer, entry, this.depth + 1);
            directory.load();
            return directory;
        } else if (entry.isFile()) {
            return new ProjectFilesTreeItem(childrenContainer, entry, this.depth + 1);
        }
        throw new Error("Impossible");
    }

    private updateExpanded() {
        if (!this.isExpanded) {
            this.getUnderlyingElement().classList.remove("expanded");
        } else {
            this.getUnderlyingElement().classList.add("expanded");
        }
    }
}
