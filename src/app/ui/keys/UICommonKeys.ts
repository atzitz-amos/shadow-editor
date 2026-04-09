import {CommonKeyImpl} from "../../../core/utils/CommonKey";
import {Editor} from "../../../editor/Editor";

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
}