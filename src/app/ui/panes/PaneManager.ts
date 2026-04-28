import {Service} from "../../../core/threaded/service/Service";
import {IPane} from "./pane/IPane";
import {PaneDockPosition} from "./pane/PaneDockPosition";
import {UIHooks} from "../../../core/ui/engine/hooks/UIHooks";

import {PaneHooks} from "../../core/UICommonHooks";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
@Service
export class PaneManager {
    private static instance: PaneManager;

    private panes: Map<string, IPane> = new Map<string, IPane>();

    private activePanes: Map<PaneDockPosition, IPane | null> = new Map<PaneDockPosition, IPane | null>();

    static getInstance(): PaneManager {
        if (!PaneManager.instance) {
            PaneManager.instance = new PaneManager();
        }
        return PaneManager.instance;
    }

    begin(): void {

    }

    hide(pane: IPane) {
        pane.setActive(false);
        this.activePanes.set(pane.getDockPosition(), null);

        UIHooks.trigger(PaneHooks.PANE_HIDE, pane);
    }

    open(pane: IPane, dockPosition?: PaneDockPosition): void {
        if (dockPosition) {
            pane.setDockPosition(dockPosition);
        }

        if (!this.panes.has(pane.getId())) {
            this.panes.set(pane.getId(), pane);
            UIHooks.trigger(PaneHooks.PANE_ADD, pane);
        }

        this.setActive(pane);
    }

    getActivePane(dockPosition: PaneDockPosition): IPane | null {
        return this.activePanes.get(dockPosition) ?? null;
    }

    getAllPanes(dockPosition?: PaneDockPosition): IPane[] {
        if (dockPosition) {
            return Array.from(this.panes.values()).filter(pane => pane.getDockPosition() === dockPosition);
        }
        return Array.from(this.panes.values());
    }

    togglePane(id: string) {
        const pane = this.panes.get(id)!;
        if (pane.isActive()) this.hide(pane);
        else this.open(pane);
    }

    private setActive(pane: IPane) {
        pane.setActive(true);

        const oldPane = this.activePanes.get(pane.getDockPosition());
        if (oldPane !== pane) {
            if (oldPane)
                this.hide(oldPane);
            this.activePanes.set(pane.getDockPosition(), pane);
        }

        UIHooks.trigger(PaneHooks.PANE_SHOW, pane);
    }
}
