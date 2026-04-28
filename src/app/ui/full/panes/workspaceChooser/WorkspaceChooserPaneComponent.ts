import {UIPaneComponent} from "../../../panes/ui/UIPaneComponent";
import {WorkspaceService} from "../../../../../core/workspace/WorkspaceService";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class WorkspaceChooserPaneComponent extends UIPaneComponent {
    public draw(): void {
        this.clearChildren();
        this.setInnerHTML(`
            <header class="workspace-list-header">
              <div>
                <div class="overline">WORKSPACES</div>
                <div class="workspace-count">3 open · 1 detached</div>
              </div>
              <button class="pill-button">
                <i class="fa-solid fa-plus"></i>
                New
              </button>
            </header>
            <div class="workspace-cards">
              <article class="workspace-card workspace-card-active">
                <div class="workspace-card-main">
                  <div class="workspace-card-title">shadow-editor</div>
                  <div class="workspace-card-sub">TypeScript · UX sandbox</div>
                </div>
                <div class="workspace-card-meta">
                  <span class="badge">main</span>
                  <span class="badge badge-soft">+2 ~1</span>
                </div>
              </article>
              <article class="workspace-card">
                <div class="workspace-card-main">
                  <div class="workspace-card-title">shadow-runtime</div>
                  <div class="workspace-card-sub">Runtime harness</div>
                </div>
                <div class="workspace-card-meta">
                  <span class="badge">release/1.2</span>
                </div>
              </article>
              <article class="workspace-card">
                <div class="workspace-card-main">
                  <div class="workspace-card-title">shadow-lab</div>
                  <div class="workspace-card-sub">Experiments · detached</div>
                </div>
                <div class="workspace-card-meta">
                  <span class="badge badge-soft">detached</span>
                </div>
              </article>
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
    }
}
