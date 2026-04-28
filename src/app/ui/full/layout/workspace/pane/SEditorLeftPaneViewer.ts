import {HTMLUtils} from "../../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../../core/ui/engine/components/UIComponent";
import {UIHooks} from "../../../../../../core/ui/engine/hooks/UIHooks";
import {IPane} from "../../../../panes/pane/IPane";
import {PaneDockPosition} from "../../../../panes/pane/PaneDockPosition";
import {PaneHooks, UICommonHooks} from "../../../../../core/UICommonHooks";

/**
 *
 * @author Atzitz Amos
 * @date 3/7/2026
 * @since 1.0.0
 */
export class SEditorLeftPaneViewer extends UIComponent {
    private isEmpty: boolean = true;

    constructor(root: HTMLElement) {
        super(HTMLUtils.createElement("aside.focus-column-left", root));
    }

    draw(): void {
        this.getUnderlyingElement().style.display = this.isEmpty ? "none" : "flex";

        this.drawChildren();
    }

    @UIHooks.react(PaneHooks.PANE_HIDE)
    private _onPaneHide(pane: IPane): void {
        if (pane.getDockPosition() === PaneDockPosition.LEFT) {
            UIHooks.trigger(UICommonHooks.LAYOUT_CHANGE);

            this.clearChildren();
            this.isEmpty = true;
            this.draw();
        }
    }

    @UIHooks.react(PaneHooks.PANE_SHOW)
    private _onPaneShow(pane: IPane): void {
        if (pane.getDockPosition() === PaneDockPosition.LEFT) {
            this.clearChildren();
            this.isEmpty = false;
            this.addChild(pane.getComponent());
            this.draw();
        }
    }

    @UIHooks.react(PaneHooks.PANE_MOVE)
    private _onPaneMove(pane: IPane, old: string, current: string): void {
        if (old === PaneDockPosition.LEFT && current !== PaneDockPosition.LEFT) {
            this.clearChildren();
        }
    }
}
