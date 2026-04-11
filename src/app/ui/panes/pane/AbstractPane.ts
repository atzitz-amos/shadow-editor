import {IPane} from "./IPane";
import {PaneDockPosition} from "./PaneDockPosition";
import {Icon} from "../../../../core/ui/icons/Icon";
import {UIPaneComponent} from "../ui/UIPaneComponent";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export abstract class AbstractPane implements IPane {
    private component: UIPaneComponent | undefined;

    private groupId: number | undefined;
    private dockPosition: PaneDockPosition | undefined;

    private _isActive: boolean = false;

    setActive(active: boolean): void {
        this._isActive = active;
    }

    isActive(): boolean {
        return this._isActive;
    }

    setGroupId(groupId: number): void {
        this.groupId = groupId;
    }

    setDockPosition(position: PaneDockPosition): void {
        this.dockPosition = position;
    }

    getGroupId(): number {
        return this.groupId ??= this.getPreferredGroupId();
    }

    getDockPosition(): PaneDockPosition {
        return this.dockPosition ??= this.getPreferredDockPosition();
    }

    getComponent(): UIPaneComponent {
        return this.component ??= this.createComponent();
    }

    abstract getId(): string;

    abstract getTitle(): string;

    abstract getIcon(): Icon;

    protected getPreferredGroupId(): number {
        return 0;
    }

    protected abstract getPreferredDockPosition(): PaneDockPosition;

    protected abstract createComponent(): UIPaneComponent;

}
