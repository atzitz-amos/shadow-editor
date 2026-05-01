import {UIPaneComponent} from "../../../panes/ui/UIPaneComponent";
import {ProjectFilesTree} from "./ProjectFilesTree";
import {IPane} from "../../../panes/pane/IPane";

/**
 *
 * @author Atzitz Amos
 * @date 4/29/2026
 * @since 1.0.0
 */
export class ProjectFilesPaneComponent extends UIPaneComponent {
    constructor(pane: IPane) {
        super(pane);
    }

    public draw(): void {
        this.setInnerHTML(`
             <header class="project-pane-header">
                <div>
                  <div class="overline">Project Structure</div>
                  <div class="project-pane-meta">shadow-editor · 4 items</div>
                </div>
                <details class="project-menu">
                  <summary class="icon-button subtle project-pane-action show-tooltip" data-tooltip="Pane actions" data-tooltip-position="top" aria-label="Pane actions">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                  </summary>
                  <div class="project-menu-list" role="menu" aria-label="Pane actions">
                    <button class="project-menu-item" role="menuitem">
                      <i class="fa-solid fa-angle-up"></i>
                      <span class="menu-item-label">Collapse all</span>
                      <span class="menu-item-shortcut">Alt+[</span>
                    </button>
                    <button class="project-menu-item" role="menuitem">
                      <i class="fa-solid fa-angle-down"></i>
                      <span class="menu-item-label">Expand all</span>
                      <span class="menu-item-shortcut">Alt+]</span>
                    </button>
                    <div class="project-menu-divider" role="separator"></div>
                    <button class="project-menu-item" role="menuitem">
                      <i class="fa-solid fa-eye"></i>
                      <span class="menu-item-label">Reveal active file</span>
                      <span class="menu-item-shortcut">Ctrl+R</span>
                    </button>
                  </div>
                </details>
              </header>

              <div class="project-pane-tools">
                <div class="project-filter">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  <input placeholder="Filter files">
                </div>
                <span class="project-scope">src</span>
              </div>
            `);

        this.addChild(new ProjectFilesTree(this.getUnderlyingElement()));

        this.drawChildren();
    }
}
