import {Focusable} from "./Focusable";
import {ContextMenu} from "../../lib/menu/impl/ContextMenu";

/**
 *
 * @author Atzitz Amos
 * @date 8/7/2026
 * @since 1.0.0
 */
export abstract class Actionable extends Focusable {
    protected setContextMenu(contextMenu: ContextMenu) {
        super.setContextMenu(contextMenu);
    }
}
