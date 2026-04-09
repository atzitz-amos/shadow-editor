import {IPane} from "../pane/IPane";
import {UIHook} from "../../ui/engine/hooks/UIHook";
import {PaneDockPosition} from "../pane/PaneDockPosition";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class PaneHooks {
    public static readonly PANE_SHOW = new UIHook<[IPane]>(this, "PANE_SHOW");
    public static readonly PANE_HIDE = new UIHook<[IPane]>(this, "PANE_HIDE");
    public static readonly PANE_MOVE = new UIHook<[IPane, PaneDockPosition, PaneDockPosition]>(this, "PANE_MOVE");
    public static readonly PANE_ADD = new UIHook<[IPane]>(this, "PANE_ADD");
}
