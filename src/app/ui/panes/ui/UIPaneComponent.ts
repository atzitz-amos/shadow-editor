import {UIComponent} from "../../../../core/ui/engine/components/UIComponent";
import {HTMLUtils} from "../../../../editor/utils/HTMLUtils";
import {IPane} from "../pane/IPane";
import {PaneDockPosition} from "../pane/PaneDockPosition";
import {UIHooks} from "../../../../core/ui/engine/listeners/hooks/UIHooks";

import {PaneHooks} from "../../../core/UICommonHooks";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export abstract class UIPaneComponent extends UIComponent {
    constructor(private readonly pane: IPane) {
        super(HTMLUtils.createElement(`div#pane-id-${pane.getId()}.pane-component.pane-component-${pane.getDockPosition()}`));
    }

    protected onPaneShown(): void {
        this.getUnderlyingElement().classList.add("active");
    }

    protected onPaneHidden(): void {
        this.getUnderlyingElement().classList.remove("active");
    }

    protected onPaneMoved(old: PaneDockPosition, current: PaneDockPosition): void {
        this.getUnderlyingElement().classList.remove(`pane-component-${old}`);
        this.getUnderlyingElement().classList.add(`pane-component-${current}`);
    }

    @UIHooks.react(PaneHooks.PANE_HIDE)
    private _onPaneHide(pane: IPane): void {
        if (pane.getId() === this.pane.getId()) {
            this.onPaneHidden();
        }
    }

    @UIHooks.react(PaneHooks.PANE_SHOW)
    private _onPaneShow(pane: IPane): void {
        if (pane.getId() === this.pane.getId()) {
            this.onPaneShown();
        }
    }

    @UIHooks.react(PaneHooks.PANE_MOVE)
    private _onPaneMove(pane: IPane, old: PaneDockPosition, current: PaneDockPosition): void {
        if (pane.getId() === this.pane.getId()) {
            this.onPaneMoved(old, current);
        }
    }
}
