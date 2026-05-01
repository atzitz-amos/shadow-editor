import {AbstractPane} from "../../../panes/pane/AbstractPane";
import {PaneDockPosition} from "../../../panes/pane/PaneDockPosition";
import {Icon} from "../../../../../core/ui/icons/Icon";
import {FaIcon} from "../../../../../core/ui/icons/FaIcon";
import {UIPaneComponent} from "../../../panes/ui/UIPaneComponent";
import {ProjectFilesPaneComponent} from "./ProjectFilesPaneComponent";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class ProjectFilesPane extends AbstractPane {
    getId(): string {
        return "project-structure";
    }

    getTitle(): string {
        return "Project Structure";
    }

    getIcon(): Icon {
        return FaIcon.faFolder();
    }

    protected createComponent(): UIPaneComponent {
        return new ProjectFilesPaneComponent(this);
    }

    protected getPreferredDockPosition(): PaneDockPosition {
        return PaneDockPosition.LEFT;
    }

}
