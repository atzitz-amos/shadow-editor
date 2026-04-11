import {UIHook} from "../../../../core/ui/engine/hooks/UIHook";
import {ITab} from "../tab/ITab";

/**
 *
 * @author Atzitz Amos
 * @date 4/10/2026
 * @since 1.0.0
 */
export class TabHooks {
    public static readonly NEW_TAB = new UIHook<[ITab]>(this, "NEW_TAB");
    public static readonly TAB_ACTIVE = new UIHook<[ITab]>(this, "TAB_ACTIVE");
    public static readonly TAB_HIDE = new UIHook<[ITab]>(this, "TAB_HIDE");
    public static readonly TAB_CLOSE = new UIHook<[ITab]>(this, "TAB_HIDE");
}
