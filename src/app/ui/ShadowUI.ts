import {Editor} from "../../editor/Editor";
import {IdePopup} from "../../core/ui/lib/popup/IdePopup";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export interface ShadowUI {
    draw(): void;

    getMainEditor(): Editor;

    showPopup(popup: IdePopup): void;

    cancelPopup(): void;
}
