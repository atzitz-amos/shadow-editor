import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {Project} from "../../../../../core/project/Project";

/**
 *
 * @author Atzitz Amos
 * @date 4/20/2026
 * @since 1.0.0
 */
export class ProjectCardComponent extends UIComponent {
    public constructor(root: HTMLElement, private readonly project: Project) {
        super(HTMLUtils.createElement("article.project-card", root));
    }


    public draw(): void {
        this.setInnerHTML(`
                <div class="project-card-main">
                  <div class="project-card-title">${this.project.getName()}</div>
                  <div class="project-card-sub">Typescript</div>
                </div>
                <div class="project-card-meta">
                  <span class="badge">detached</span>
                </div>`);
    }

    public setActive(active: boolean): void {
        if (active) {
            this.getUnderlyingElement().classList.add("project-card-active");
        } else {
            this.getUnderlyingElement().classList.remove("project-card-active");
        }
    }
}
