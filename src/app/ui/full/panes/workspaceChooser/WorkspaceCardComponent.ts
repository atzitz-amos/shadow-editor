import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {Workspace} from "../../../../../core/workspace/Workspace";

/**
 *
 * @author Atzitz Amos
 * @date 4/20/2026
 * @since 1.0.0
 */
export class WorkspaceCardComponent extends UIComponent {
    public constructor(root: HTMLElement, private readonly workspace: Workspace) {
        super(HTMLUtils.createElement("article.workspace-card", root));
    }


    public draw(): void {
        this.setInnerHTML(`
                <div class="workspace-card-main">
                  <div class="workspace-card-title">${this.workspace.getName()}</div>
                  <div class="workspace-card-sub">Typescript</div>
                </div>
                <div class="workspace-card-meta">
                  <span class="badge">detached</span>
                </div>`);
    }

    public setActive(active: boolean): void {
        if (active) {
            this.getUnderlyingElement().classList.add("workspace-card-active");
        } else {
            this.getUnderlyingElement().classList.remove("workspace-card-active");
        }
    }
}
