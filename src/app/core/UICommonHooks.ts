import {UIHook} from "../../core/ui/engine/listeners/hooks/UIHook";
import {IPane} from "./panes/pane/IPane";
import {PaneDockPosition} from "./panes/pane/PaneDockPosition";
import {ITab} from "./tabs/ITab";
import {Workspace} from "../../core/workspace/Workspace";
import {ProjectFilesTreeNode} from "../ui/full/panes/projectFiles/tree/ProjectFilesTreeNode";
import {UIComponent} from "../../core/ui/engine/components/UIComponent";

/**
 *
 * @author Atzitz Amos
 * @date 4/10/2026
 * @since 1.0.0
 */
export class UICommonHooks {
    public static readonly LAYOUT_CHANGE = new UIHook<[]>(this, "LAYOUT_CHANGE");
    public static readonly FOCUS_CHANGE = new UIHook<[HTMLElement, HTMLElement]>(this, "FOCUS_CHANGE");
}

export class PaneHooks {
    public static readonly PANE_SHOW = new UIHook<[IPane]>(this, "PANE_SHOW");
    public static readonly PANE_HIDE = new UIHook<[IPane]>(this, "PANE_HIDE");
    public static readonly PANE_MOVE = new UIHook<[IPane, PaneDockPosition, PaneDockPosition]>(this, "PANE_MOVE");
    public static readonly PANE_ADD = new UIHook<[IPane]>(this, "PANE_ADD");
    public static readonly PANE_REMOVE = new UIHook<[IPane]>(this, "PANE_REMOVE");
}

export class TabHooks {
    public static readonly NEW_TAB = new UIHook<[ITab]>(this, "NEW_TAB");
    public static readonly TAB_ACTIVE = new UIHook<[ITab]>(this, "TAB_ACTIVE");
    public static readonly TAB_HIDE = new UIHook<[ITab]>(this, "TAB_HIDE");
    public static readonly TAB_CLOSE = new UIHook<[ITab]>(this, "TAB_HIDE");
}

export class WorkspaceHooks {
    public static readonly WORKSPACE_CHANGED = new UIHook<[Workspace]>(this, "WORKSPACE_CHANGED");
    public static readonly PROJECT_FILES_SELECTED_CHANGED = new UIHook<[(ProjectFilesTreeNode & UIComponent)]>(this, "PROJECT_FILES_ACTIVE_CHANGED");
}