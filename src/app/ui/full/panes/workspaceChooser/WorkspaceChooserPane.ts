import {AbstractPane} from "../../../panes/pane/AbstractPane";
import {PaneDockPosition} from "../../../panes/pane/PaneDockPosition";
import {Icon} from "../../../../../core/ui/icons/Icon";
import {FaIcon} from "../../../../../core/ui/icons/FaIcon";
import {WorkspaceChooserPaneComponent} from "./WorkspaceChooserPaneComponent";
import {UIPaneComponent} from "../../../panes/ui/UIPaneComponent";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class WorkspaceChooserPane extends AbstractPane {
    getId(): string {
        return "workspace-chooser";
    }

    getTitle(): string {
        return "Workspace";
    }

    getIcon(): Icon {
        return FaIcon.faDiagramProject();
    }

    protected createComponent(): UIPaneComponent {
        return new WorkspaceChooserPaneComponent(this);
    }

    protected getPreferredDockPosition(): PaneDockPosition {
        return PaneDockPosition.LEFT;
    }

}
