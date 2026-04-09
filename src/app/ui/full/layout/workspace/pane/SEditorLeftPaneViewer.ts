import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {UIHooks} from "../../../../../../core/ui/engine/hooks/UIHooks";
import {PaneHooks} from "../../../../../../core/panes/hooks/PaneHooks";
import {IPane} from "../../../../../../core/panes/pane/IPane";
import {PaneDockPosition} from "../../../../../../core/panes/pane/PaneDockPosition";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorLeftPaneViewer extends UIComponent {
    constructor(root: HTMLElement) {
        super(HTMLUtils.createElement("aside.focus-column-left", root));
    }

    draw(): void {
        this.drawChildren();
    }

    @UIHooks.react(PaneHooks.PANE_HIDE)
    private _onPaneHide(pane: IPane): void {
        if (pane.getDockPosition() === PaneDockPosition.LEFT) {
            this.setInnerHTML('');
        }
    }

    @UIHooks.react(PaneHooks.PANE_SHOW)
    private _onPaneShow(pane: IPane): void {
        if (pane.getDockPosition() === PaneDockPosition.LEFT) {
            this.setInnerHTML('');
            this.addChild(pane.getComponent());
            this.draw();
        }
    }

    @UIHooks.react(PaneHooks.PANE_MOVE)
    private _onPaneMove(pane: IPane, old: string, current: string): void {
        if (old === PaneDockPosition.LEFT && current !== PaneDockPosition.LEFT) {
            this.setInnerHTML('');
        }
    }
}
