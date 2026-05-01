import {UIPaneComponent} from "../../../panes/ui/UIPaneComponent";
import {GlobalState} from "../../../../../core/global/GlobalState";
import {WorkspaceCardComponent} from "./WorkspaceCardComponent";
import {UIMutators} from "../../../../../core/ui/engine/listeners/mutators/UIMutators";
import {MutatationType} from "../../../../../core/ui/engine/listeners/mutators/UIMutator";
import {UICommonMutators} from "../../../../core/UICommonMutators";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class WorkspaceChooserPaneComponent extends UIPaneComponent {
    public draw(): void {
        const workspaces = GlobalState.getWorkspaceService().getAllWorkspaces();

        this.setInnerHTML(`
            <header class="workspace-list-header">
              <div>
                <div class="overline">WORKSPACES</div>
                <div class="workspace-count">${workspaces.length} available${GlobalState.getCurrentWorkspace() == null ? "" : " · 1 open"}</div>
              </div>
              <button class="pill-button">
                <i class="fa-solid fa-plus"></i>
                New
              </button>
            </header>
            <div class="workspace-cards">
            </div>

            <div class="workspace-footer">
              <div class="workspace-footer-label">Pinned tasks</div>
              <div class="workspace-footer-items">
                <span class="tag-chip">
                  <i class="fa-solid fa-bolt-lightning"></i>
                  Smoke tests
                </span>
                <span class="tag-chip">
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                  Tune theme
                </span>
              </div>
            </div>`);

        const workspaceCardsContainer = this.getUnderlyingElement().querySelector(".workspace-cards") as HTMLElement;
        for (let workspace of workspaces) {
            this.addChild(new WorkspaceCardComponent(workspaceCardsContainer, workspace));
        }

        this.drawChildren();
    }

    @UIMutators.on(UICommonMutators.WORKSPACE_LIST, MutatationType.MUTATED)
    private onWorkspaceListMutated() {
        this.draw();
    }
}
