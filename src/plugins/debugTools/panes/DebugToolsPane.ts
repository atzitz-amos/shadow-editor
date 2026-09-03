import {AbstractPane} from "../../../app/core/panes/pane/AbstractPane";
import {PaneDockPosition} from "../../../app/core/panes/pane/PaneDockPosition";
import {UIPaneComponent} from "../../../app/core/panes/ui/UIPaneComponent";
import {Icon} from "../../../core/ui/icons/Icon";
import {FaIcon} from "../../../core/ui/icons/FaIcon";
import {GlobalState} from "../../../core/global/GlobalState";
import {SynTreeChangedEvent} from "../../../editor/core/lang/events/SynTreeChangedEvent";
import {DebugToolsPaneComponent} from "./DebugToolsPaneComponent";
import {CaretMovedEvent} from "../../../editor/core/caret/events/CaretMovedEvent";
import {SynDocumentManager} from "../../../lang/syntax/manager/SynDocumentManager";
import {SynEditorTreeChangedEvent} from "../../../editor/core/lang/events/SynEditorTreeChangedEvent";

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

    onHide() {
        GlobalState.getMainEventBus().unsubscribe(this, SynTreeChangedEvent.SUBSCRIBER);
        GlobalState.getMainEventBus().unsubscribe(this, CaretMovedEvent.SUBSCRIBER);
    }

    protected onShow() {
        if (GlobalState.getMainEditor() !== null) {
            (this.getComponent() as DebugToolsPaneComponent).onSynTreeChanged(
                GlobalState.getMainEditor(),
                SynDocumentManager.getSynDocument(GlobalState.getMainEditor().getOpenedDocument()));
        }

        GlobalState.getMainEventBus().subscribe(this, SynEditorTreeChangedEvent.SUBSCRIBER, e => {
            (this.getComponent() as DebugToolsPaneComponent).onSynTreeChanged(e.getEditor(), e.getSynDocument());
        });

        GlobalState.getMainEventBus().subscribe(this, CaretMovedEvent.SUBSCRIBER, e => {
            (this.getComponent() as DebugToolsPaneComponent).onCaretMoved(e.getCaret().getOffset());
        });
    }

    protected createComponent(): UIPaneComponent {
        return new DebugToolsPaneComponent(this);
    }

    protected getPreferredDockPosition(): PaneDockPosition {
        return PaneDockPosition.LEFT;
    }
}
