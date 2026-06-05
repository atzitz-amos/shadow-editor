import {AbstractPane} from "../../../app/core/panes/pane/AbstractPane";
import {PaneDockPosition} from "../../../app/core/panes/pane/PaneDockPosition";
import {UIPaneComponent} from "../../../app/core/panes/ui/UIPaneComponent";
import {Icon} from "../../../core/ui/icons/Icon";
import {FaIcon} from "../../../core/ui/icons/FaIcon";
import {GlobalState} from "../../../core/global/GlobalState";
import {SynTreeChangedEvent} from "../../../editor/core/lang/events/SynTreeChangedEvent";
import {DebugToolsPaneComponent} from "./DebugToolsPaneComponent";

/**
 *
 * @author Atzitz Amos
 * @date 6/3/2026
 * @since 1.0.0
 */
export default class DebugToolsPane extends AbstractPane {
    getId(): string {
        return "debug-tools-pane";
    }

    getTitle(): string {
        return "Debug Tools";
    }

    getIcon(): Icon {
        return FaIcon.solid("code");
    }

    onAdd() {
        console.log("Add");
        GlobalState.getMainEventBus().subscribe(this, SynTreeChangedEvent.SUBSCRIBER, e => {
            (this.getComponent() as DebugToolsPaneComponent).onSynTreeChanged(e);
        });
    }

    onRemove() {
        console.log("Remove");
        GlobalState.getMainEventBus().unsubscribe(this, SynTreeChangedEvent.SUBSCRIBER);
    }

    protected createComponent(): UIPaneComponent {
        return new DebugToolsPaneComponent(this);
    }

    protected getPreferredDockPosition(): PaneDockPosition {
        return PaneDockPosition.LEFT;
    }
}
