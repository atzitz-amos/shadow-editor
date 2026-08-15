import {AbstractPane} from "../../../../core/panes/pane/AbstractPane";
import {PaneDockPosition} from "../../../../core/panes/pane/PaneDockPosition";
import {Icon} from "../../../../../core/ui/icons/Icon";
import {FaIcon} from "../../../../../core/ui/icons/FaIcon";
import {ProjectChooserPaneComponent} from "./ProjectChooserPaneComponent";
import {UIPaneComponent} from "../../../../core/panes/ui/UIPaneComponent";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class ProjectChooserPane extends AbstractPane {
    getId(): string {
        return "project-chooser";
    }

    getTitle(): string {
        return "Project";
    }

    getIcon(): Icon {
        return FaIcon.faDiagramProject();
    }

    protected createComponent(): UIPaneComponent {
        return new ProjectChooserPaneComponent(this);
    }

    protected getPreferredDockPosition(): PaneDockPosition {
        return PaneDockPosition.LEFT;
    }

}
