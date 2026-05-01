import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {UIHooks} from "../../../../../core/ui/engine/listeners/hooks/UIHooks";
import {PaneManager} from "../../../panes/PaneManager";
import {PaneDockPosition} from "../../../panes/pane/PaneDockPosition";
import {SRailButton} from "./SRailButton";
import {IPane} from "../../../panes/pane/IPane";
import {PaneHooks} from "../../../../core/UICommonHooks";

/**
 *
 * @author Atzitz Amos
 * @date 3/3/2026
 * @since 1.0.0
 */
export class SLeftActionRail extends UIComponent {
    constructor(root: HTMLElement) {
        super(HTMLUtils.createElement("nav.rail", root));
    }

    draw(): void {
        this.clearChildren();

        let lastGroupNumber = 0;
        for (const pane of PaneManager.getInstance().getAllPanes(PaneDockPosition.LEFT)) {
            if (pane.getGroupId() > lastGroupNumber) {
                this.addHtmlElement(HTMLUtils.createElement("hr"));
                lastGroupNumber = pane.getGroupId();
            }
            const railButton = new SRailButton(pane.getId(), pane.getTitle(), pane.getIcon());
            if (pane.isActive()) {
                railButton.setActive(true);
            }

            this.addChild(railButton);
        }
        this.drawChildren();
    }

    @UIHooks.react(PaneHooks.PANE_ADD)
    private _onPaneAdd(): void {
        this.draw();
    }

    @UIHooks.react(PaneHooks.PANE_MOVE)
    private _onPaneMove(pane: IPane, old: PaneDockPosition, current: PaneDockPosition): void {
        if (old === PaneDockPosition.LEFT || current === PaneDockPosition.LEFT) {
            this.draw();
        }
    }

    @UIHooks.react(PaneHooks.PANE_HIDE)
    private _onPaneHide(pane: IPane): void {
        this.getChild(SRailButton, c => c.getPaneId() === pane.getId())?.setActive(false);
    }

    @UIHooks.react(PaneHooks.PANE_SHOW)
    private _onPaneShow(pane: IPane): void {
        this.getChild(SRailButton, c => c.getPaneId() === pane.getId())?.setActive(true);
    }

}
