import {UIHook} from "../../core/ui/engine/hooks/UIHook";

/**
 *
 * @author Atzitz Amos
 * @date 4/10/2026
 * @since 1.0.0
 */
export class UICommonHooks {
    public static readonly LAYOUT_CHANGE = new UIHook<[]>(this, "LAYOUT_CHANGE");
}
