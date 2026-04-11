import {PaneDockPosition} from "./PaneDockPosition";
import {Icon} from "../../../../core/ui/icons/Icon";
import {UIPaneComponent} from "../ui/UIPaneComponent";

/**
 * Represents an editor pane within the Shadow editor.
 * Panes can be moved, resized and collapsed
 *
 * @author Atzitz Amos
 * @date 11/6/2025
 * @since 1.0.0
 */
export interface IPane {
    getId(): string;

    getTitle(): string;

    getIcon(): Icon;

    getGroupId(): number;

    setGroupId(groupId: number): void;

    getDockPosition(): PaneDockPosition;

    setDockPosition(position: PaneDockPosition): void;

    setActive(active: boolean): void;

    isActive(): boolean;

    getComponent(): UIPaneComponent;
}
