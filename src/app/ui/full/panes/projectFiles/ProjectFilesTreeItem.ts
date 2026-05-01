import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {RelativePath} from "../../../../../core/workspace/filesystem/path/RelativePath";
import {EditorURI} from "../../../../../core/uri/EditorURI";
import {URIManager} from "../../../../../core/uri/URIManager";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesTreeItem extends UIComponent {
    private readonly depth: number;
    private readonly path: RelativePath;
    private readonly uri: EditorURI;

    constructor(root: HTMLElement, path: RelativePath, uri: EditorURI, depth: number) {
        super(HTMLUtils.createDiv(`tree-item`, root));
        this.depth = depth;
        this.path = path;
        this.uri = uri;
    }

    public setActive() {
        document.querySelector(".tree-item.active")?.classList.remove("active");
        this.getUnderlyingElement().classList.add("active");

        URIManager.openAsync(this.uri);
    }

    public setSelected() {
        document.querySelector(".tree-item-file-header.selected, .tree-item-header.selected")?.classList.remove("selected");
        this.getUnderlyingElement().querySelector(".tree-item-file-header")?.classList.add("selected");
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
            this.setActive();
        });
    }
}
