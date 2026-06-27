import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {RelativePath} from "../../../../../../core/workspace/filesystem/path/RelativePath";
import {EditorURI} from "../../../../../../core/uri/EditorURI";
import {URINavigationManager} from "../../../../../../core/uri/URINavigationManager";
import {ProjectFilesTreeNode} from "./ProjectFilesTreeNode";
import {FSNodeEntry} from "../../../../../../core/workspace/filesystem/tree/FSNodeEntry";
import {WorkspaceFile} from "../../../../../../core/workspace/filesystem/tree/WorkspaceFile";
import {UIHooks} from "../../../../../../core/ui/engine/listeners/hooks/UIHooks";
import {WorkspaceHooks} from "../../../../../core/UICommonHooks";
import {ProjectFilesPaneHelper} from "../ProjectFilesPaneHelper";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesTreeItem extends UIComponent implements ProjectFilesTreeNode {
    private readonly path: RelativePath;
    private readonly uri: EditorURI;

    constructor(root: HTMLElement, private readonly file: WorkspaceFile, private readonly depth: number) {
        super(HTMLUtils.createDiv(`tree-item`, root));
        this.path = file.getPath();
        this.uri = file.getURI();
    }

    getEntry(): FSNodeEntry {
        return this.file;
    }

    getDepth(): number {
        return this.depth;
    }

    public open() {
        document.querySelector(".tree-item.active")?.classList.remove("active");
        this.getUnderlyingElement().classList.add("active");

        URINavigationManager.navigateAsync(this.uri);
    }

    public setSelected() {
        document.querySelector(".tree-item-file-header.selected, .tree-item-header.selected")?.classList.remove("selected");
        this.getUnderlyingElement().querySelector(".tree-item-file-header")?.classList.add("selected");

        ProjectFilesPaneHelper.setSelected(this);
    }

    public draw(): void {
        this.setInnerHTML(`
          <div class="tree-item-file-header">
              <i class="fa-solid fa-file-lines tree-icon file"></i>
              <span class="tree-name">${this.path.name()}</span>
          </div>
        `);

        const header = this.getUnderlyingElement().querySelector(".tree-item-file-header") as HTMLElement;
        header.addEventListener("click", () => {
            this.setSelected();
        });

        header.addEventListener("dblclick", () => {
            this.open();
        });
    }
}
