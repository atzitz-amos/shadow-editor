import {HTMLUtils} from "../../../../../editor/utils/HTMLUtils";
import {UIComponent} from "../../../../../core/ui/engine/components/UIComponent";
import {PaneHooks} from "../../../../../core/panes/hooks/PaneHooks";
import {UIHooks} from "../../../../../core/ui/engine/hooks/UIHooks";
import {PaneManager} from "../../../../../core/panes/PaneManager";
import {PaneDockPosition} from "../../../../../core/panes/pane/PaneDockPosition";
import {SRailButton} from "./SRailButton";
import {IPane} from "../../../../../core/panes/pane/IPane";

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
        this.setInnerHTML('');

        let lastGroupNumber = 0;
        for (const pane of PaneManager.getInstance().getAllPanes(PaneDockPosition.LEFT)) {
            if (pane.getGroupId() > lastGroupNumber) {
                this.addHtmlElement(HTMLUtils.createElement("hr"));
                lastGroupNumber = pane.getGroupId();
            }
            this.addChild(new SRailButton(pane.getId(), pane.getTitle(), pane.getIcon()));
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

}
