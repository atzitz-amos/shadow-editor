import {Editor} from "../../editor/Editor";
import {IdeDialog} from "../../core/ui/lib/dialog/IdeDialog";

/**
 *
 * @author Atzitz Amos
 * @date 2/28/2026
 * @since 1.0.0
 */
export interface ShadowUI {
    draw(): void;

    getMainEditor(): Editor;

    showDialog(popup: IdeDialog): void;

    cancelDialog(): void;

    getActiveDialog(): IdeDialog | null;
}
