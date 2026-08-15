import {UIPaneComponent} from "../../../../core/panes/ui/UIPaneComponent";
import {GlobalState} from "../../../../../core/global/GlobalState";
import {ProjectCardComponent} from "./ProjectCardComponent";
import {UIMutators} from "../../../../../core/ui/engine/listeners/mutators/UIMutators";
import {MutatationType} from "../../../../../core/ui/engine/listeners/mutators/UIMutator";
import {UICommonMutators} from "../../../../core/UICommonMutators";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class ProjectChooserPaneComponent extends UIPaneComponent {
    public draw(): void {
        const projects = GlobalState.getProjectsService().getAllProjects();

        this.setInnerHTML(`
            <header class="project-list-header">
              <div>
                <div class="overline">PROJECTS</div>
                <div class="project-count">${projects.length} available${GlobalState.getCurrentProject() == null ? "" : " · 1 open"}</div>
              </div>
              <button class="pill-button">
                <i class="fa-solid fa-plus"></i>
                New
              </button>
            </header>
            <div class="project-cards">
            </div>

            <div class="project-footer">
              <div class="project-footer-label">Pinned tasks</div>
              <div class="project-footer-items">
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

        const projectCardsContainer = this.getUnderlyingElement().querySelector(".project-cards") as HTMLElement;
        for (let project of projects) {
            this.addChild(new ProjectCardComponent(projectCardsContainer, project));
        }

        this.drawChildren();
    }

    @UIMutators.when(UICommonMutators.PROJECT_LIST, MutatationType.MUTATED)
    private onProjectListMutated() {
        console.log("mutated project list");
        this.draw();
    }
}
