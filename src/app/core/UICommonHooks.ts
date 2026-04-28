import {UIHook} from "../../core/ui/engine/hooks/UIHook";
import {IPane} from "../ui/panes/pane/IPane";
import {PaneDockPosition} from "../ui/panes/pane/PaneDockPosition";
import {ITab} from "../ui/tabs/tab/ITab";

/**
 *
 * @author Atzitz Amos
 * @date 4/10/2026
 * @since 1.0.0
 */
export class UICommonHooks {
    public static readonly LAYOUT_CHANGE = new UIHook<[]>(this, "LAYOUT_CHANGE");
}

export class PaneHooks {
    public static readonly PANE_SHOW = new UIHook<[IPane]>(this, "PANE_SHOW");
    public static readonly PANE_HIDE = new UIHook<[IPane]>(this, "PANE_HIDE");
    public static readonly PANE_MOVE = new UIHook<[IPane, PaneDockPosition, PaneDockPosition]>(this, "PANE_MOVE");
    public static readonly PANE_ADD = new UIHook<[IPane]>(this, "PANE_ADD");
}

export class TabHooks {
    public static readonly NEW_TAB = new UIHook<[ITab]>(this, "NEW_TAB");
    public static readonly TAB_ACTIVE = new UIHook<[ITab]>(this, "TAB_ACTIVE");
    public static readonly TAB_HIDE = new UIHook<[ITab]>(this, "TAB_HIDE");
    public static readonly TAB_CLOSE = new UIHook<[ITab]>(this, "TAB_HIDE");
}
