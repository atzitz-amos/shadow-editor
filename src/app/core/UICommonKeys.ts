import {CommonKeyImpl} from "../../core/utils/CommonKey";
import {Editor} from "../../editor/Editor";
import {ITab} from "../ui/tabs/ITab";

/**
 *
 * @author Atzitz Amos
 * @date 4/9/2026
 * @since 1.0.0
 */
export class UICommonKey<T> extends CommonKeyImpl<T> {
}

export class UICommonKeys {
    public static MAIN_EDITOR = new UICommonKey<Editor>("ui.main-editor");
    public static CURRENT_TAB = new UICommonKey<ITab>("ui.current-tab");
}